// packages/api/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError';
import config from '../config';
import { User, IUser } from '../models/user.model';
import { redisClient } from '../redis';

interface JwtPayload {
  sub: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: No token provided');
    }

    // Check if token is blacklisted (logged out)
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: Token is invalid');
    }

    const decoded = jwt.verify(token, config.jwt.accessTokenSecret) as JwtPayload;

    const user = await User.findById(decoded.sub).select('-password');

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: User not found');
    }

    if (!user.isVerified) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: Please verify your email address');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized: Invalid token'));
    }
    next(error);
  }
};
