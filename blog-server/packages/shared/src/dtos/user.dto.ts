// packages/shared/src/dtos/user.dto.ts
import { z } from 'zod';
import { USER_ROLES } from '../constants';
import { createZodDto } from '../utils/zod.utils';

export const UpdateUserSchema = z
  .object({
    name: z.string().min(3).max(50),
    // You can add other profile fields here, like bio, social links, etc.
    // bio: z.string().max(200).optional(),
  })
  .partial(); // Makes all fields optional for PATCH requests

export class UpdateUserDto {
  name?: string;

  constructor(data: Partial<UpdateUserDto>) {
    Object.assign(this, UpdateUserSchema.parse(data));
  }
}

export const AdminCreateUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  roles: z.array(z.nativeEnum(USER_ROLES)).optional(),
  isVerified: z.boolean().optional(),
});
export class AdminCreateUserDto {
  name!: string;
  email!: string;
  password!: string;
  roles?: (keyof typeof USER_ROLES)[];
  isVerified?: boolean;

  constructor(data: Partial<AdminCreateUserDto>) {
    const parsedData = AdminCreateUserSchema.parse(data);
    Object.assign(this, parsedData);
  }
}
