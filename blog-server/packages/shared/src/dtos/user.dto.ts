// packages/shared/src/dtos/user.dto.ts
import { z } from 'zod';

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
