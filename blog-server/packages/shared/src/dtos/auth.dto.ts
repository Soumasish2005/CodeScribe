// packages/shared/src/dtos/auth.dto.ts
import { z } from 'zod';

export const RegisterUserSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});
export class RegisterUserDto {
  name!: string;
  email!: string;
  password!: string;

  static validate(data: unknown) {
    return RegisterUserSchema.parse(data);
  }
}

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export class LoginUserDto {
  email!: string;
  password!: string;

  static validate(data: unknown) {
    return LoginUserSchema.parse(data);
  }
}

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});
export class ForgotPasswordDto {
  email!: string;

  static validate(data: unknown) {
    return ForgotPasswordSchema.parse(data);
  }
}

export const ResetPasswordSchema = z.object({
  password: z.string().min(8),
});
export class ResetPasswordDto {
  password!: string;

  static validate(data: unknown) {
    return ResetPasswordSchema.parse(data);
  }
}
