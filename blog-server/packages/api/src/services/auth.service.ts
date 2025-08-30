// packages/api/src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { RegisterUserDto, LoginUserDto } from '@devnovate/shared/dtos/auth.dto';
import { User, IUser } from '../models/user.model';
import { ApiError } from '../utils/apiError';
import config from '../config';
import { redisClient } from '../redis';
import { sendEmail } from '../mailer';
import { logger } from '../utils/logger';

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

export class AuthService {
  /**
   * Generates JWT access and refresh tokens for a given user ID.
   */
  private generateTokens(userId: string) {
    const accessToken = jwt.sign({ sub: userId }, config.jwt.accessTokenSecret, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ sub: userId }, config.jwt.refreshTokenSecret, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  /**
   * Registers a new user, saves them to the database, and sends a verification email.
   */
  public async register(userData: RegisterUserDto): Promise<IUser> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'User with this email already exists');
    }

    const user = new User(userData);
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // Construct the full verification URL for the email
    const verificationUrl = `http://localhost:${config.port}${config.apiPrefix}/auth/verify/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Devnovate Account',
      template: 'account-verification',
      context: { name: user.name, verificationUrl },
    });

    logger.info(`Verification token for ${user.email}: ${verificationToken}`);
    return user;
  }

  /**
   * Logs in a user by verifying their credentials and returns a new set of tokens.
   */
  public async login(loginData: LoginUserDto): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email: loginData.email }).select('+password');
    if (!user || !(await user.comparePassword(loginData.password))) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
    }

    if (!user.isVerified) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Please verify your email address before logging in.');
    }

    const { accessToken, refreshToken } = this.generateTokens(user._id.toString());

    // Remove password from the user object before returning
    const userObject = user.toObject();
    delete userObject.password;

    return { user: userObject, accessToken, refreshToken };
  }

  /**
   * Logs out a user by blacklisting their current tokens in Redis.
   */
  public async logout(accessToken: string, refreshToken: string): Promise<void> {
    const decodedAccess = jwt.decode(accessToken) as JwtPayload;
    if (decodedAccess?.exp) {
      const expiresIn = decodedAccess.exp - Math.floor(Date.now() / 1000);
      // Blacklist token until it naturally expires
      if (expiresIn > 0) {
        await redisClient.set(`blacklist:${accessToken}`, 'true', { EX: expiresIn });
      }
    }

    const decodedRefresh = jwt.decode(refreshToken) as JwtPayload;
    if (decodedRefresh?.exp) {
      const expiresIn = decodedRefresh.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await redisClient.set(`blacklist:${refreshToken}`, 'true', { EX: expiresIn });
      }
    }
  }

  /**
   * Refreshes an access token using a valid refresh token. Implements token rotation.
   */
  public async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token has been invalidated');
      }

      const decoded = jwt.verify(token, config.jwt.refreshTokenSecret) as JwtPayload;
      const user = await User.findById(decoded.sub);

      if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found');
      }

      // Token rotation: blacklist the used refresh token
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await redisClient.set(`blacklist:${token}`, 'true', { EX: expiresIn });
      }

      // Issue a new pair of tokens
      return this.generateTokens(user._id.toString());
    } catch (error) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired refresh token');
    }
  }

  /**
   * Verifies a user's email address using a token.
   */
  public async verifyEmail(token: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Token is invalid or has expired');
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();
  }

  /**
   * Initiates the password reset process for a user.
   */
  public async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });

    // Important: Always return a success-like message to prevent user enumeration
    if (!user) {
      logger.warn(`Password reset attempt for non-existent user: ${email}`);
      return;
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Skip validation to save token fields

    const resetUrl = `http://frontend-app.com/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Your Devnovate Password Reset Link',
        template: 'password-reset',
        context: { name: user.name, resetUrl },
      });
      logger.info(`Password reset email sent to ${user.email}`);
    } catch (error) {
      // Clear tokens if email fails to prevent a locked state
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to send password reset email');
    }
  }

  /**
   * Resets a user's password using a valid token.
   */
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Token is invalid or has expired');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    // The pre-save hook in user.model.ts will hash the new password
    await user.save();
  }
}
