// packages/api/src/services/user.service.ts
import { StatusCodes } from 'http-status-codes';
import { User, IUser } from '../models/user.model';
import { ApiError } from '../utils/apiError';
import { AdminCreateUserDto } from '@devnovate/shared/dtos/user.dto';
import { USER_ROLES } from '@devnovate/shared/constants';

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
  public async createUserByAdmin(userData: AdminCreateUserDto): Promise<IUser> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'User with this email already exists');
    }

    const newUser = new User({
      ...userData,
      roles: userData.roles || [USER_ROLES.USER],
      isVerified: userData.isVerified ?? true, // Default to verified
    });

    await newUser.save();

    // The password will be hashed by the pre-save hook in user.model.ts
    const userObject = newUser.toObject();
    delete userObject.password;

    return userObject;
  }
}
