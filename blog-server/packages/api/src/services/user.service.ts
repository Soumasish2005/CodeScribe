// packages/api/src/services/user.service.ts
import { StatusCodes } from 'http-status-codes';
import { User, IUser } from '../models/user.model';
import { ApiError } from '../utils/apiError';

export class UserService {
  public async getUserById(id: string): Promise<IUser> {
    const user = await User.findById(id).lean();
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
  }

  public async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser> {
    // Whitelist fields that can be updated
    const allowedUpdates = ['name'];
    const updates: Partial<IUser> = {};

    for (const key of allowedUpdates) {
      if (updateData[key as keyof IUser]) {
        updates[key as keyof IUser] = updateData[key as keyof IUser];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No valid fields to update');
    }

    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).lean();
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    return user;
  }
}
