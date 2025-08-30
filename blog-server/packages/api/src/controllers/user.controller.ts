// packages/api/src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../utils/apiResponse';
import { UpdateUserDto } from '@devnovate/shared/dtos/user.dto';

export class UserController {
  constructor(private userService: UserService) {}

  /**
   * @desc    Get the profile of the currently logged-in user
   * @route   GET /api/v1/users/me
   * @access  Private
   */
  public getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // The user object is attached by the authMiddleware, so we can be confident it exists.
      const userProfile = await this.userService.getUserById(req.user!._id.toString());
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Profile fetched successfully', userProfile));
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Update the profile of the currently logged-in user
   * @route   PATCH /api/v1/users/me/profile
   * @access  Private
   */
  public updateMyProfile = async (
    req: Request<Record<string, never>, any, UpdateUserDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const updatedUser = await this.userService.updateUser(req.user!._id.toString(), req.body);
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Profile updated successfully', updatedUser));
    } catch (error) {
      next(error);
    }
  };
}
