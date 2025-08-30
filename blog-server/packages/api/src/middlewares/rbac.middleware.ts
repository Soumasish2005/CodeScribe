// packages/api/src/middlewares/rbac.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/apiError';
import { UserRole } from '@devnovate/shared/types';

export const rbacMiddleware = (requiredRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required'));
    }

    const userRoles = req.user.roles;
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return next(new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: You do not have permission to perform this action'));
    }

    next();
  };
};
