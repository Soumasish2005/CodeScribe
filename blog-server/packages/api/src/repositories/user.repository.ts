// packages/api/src/repositories/user.repository.ts
import { User, IUser } from '../models/user.model';
import { RegisterUserDto } from '@devnovate/shared/dtos/auth.dto';

export class UserRepository {
  public async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select(`+password`);
  }

  public async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  public async create(userData: RegisterUserDto): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }
}
