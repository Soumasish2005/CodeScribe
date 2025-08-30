// packages/api/src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth.service';
import config from '../config';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { RegisterUserDto, LoginUserDto, ForgotPasswordDto, ResetPasswordDto } from '@devnovate/shared/dtos/auth.dto';

/**
 * Sets the refresh token in a secure, httpOnly cookie.
 * @param res - The Express response object.
 * @param refreshToken - The refresh token string.
 */
const setTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // Matches refresh token expiry (7 days)
  });
};

export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * @desc    Register a new user
   * @route   POST /api/v1/auth/register
   * @access  Public
   */
  public register = async (
    req: Request<Record<string, never>, Record<string, never>, RegisterUserDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await this.authService.register(req.body);
      res.status(StatusCodes.CREATED).json(
        new ApiResponse(StatusCodes.CREATED, 'Verification email sent. Please check your inbox.', {
          userId: user._id,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Authenticate user & get tokens
   * @route   POST /api/v1/auth/login
   * @access  Public
   */
  public login = async (
    req: Request<Record<string, never>, Record<string, never>, LoginUserDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { user, accessToken, refreshToken } = await this.authService.login(req.body);
      setTokenCookie(res, refreshToken);
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Login successful', { user, accessToken }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Log user out
   * @route   POST /api/v1/auth/logout
   * @access  Private
   */
  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
      const { refreshToken } = req.cookies;

      if (accessToken && refreshToken) {
        await this.authService.logout(accessToken, refreshToken);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
      });

      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Logout successful'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Refresh access token
   * @route   POST /api/v1/auth/refresh
   * @access  Public (requires valid refresh token cookie)
   */
  public refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token not found');
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await this.authService.refresh(refreshToken);

      setTokenCookie(res, newRefreshToken);
      res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, 'Token refreshed', { accessToken: newAccessToken }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Verify user email
   * @route   GET /api/v1/auth/verify/:token
   * @access  Public
   */
  public verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.verifyEmail(req.params.token);
      // In a real app, you would redirect to a frontend page
      res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, 'Email verified successfully. You can now log in.'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Request password reset link
   * @route   POST /api/v1/auth/forgot-password
   * @access  Public
   */
  public forgotPassword = async (
    req: Request<Record<string, never>, Record<string, never>, ForgotPasswordDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.authService.forgotPassword(req.body.email);
      res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, 'If an account with that email exists, a password reset link has been sent.')
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Reset user password
   * @route   POST /api/v1/auth/reset-password/:token
   * @access  Public
   */
  public resetPassword = async (
    req: Request<{ token: string }, Record<string, never>, ResetPasswordDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.authService.resetPassword(req.params.token, req.body.password);
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Password has been reset successfully.'));
    } catch (error) {
      next(error);
    }
  };
}
