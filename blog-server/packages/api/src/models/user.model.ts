// packages/api/src/models/user.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import argon2 from 'argon2';
import crypto from 'crypto';
import { USER_ROLES } from '@devnovate/shared/constants';
import { IUser as ISharedUser } from '@devnovate/shared/types'; // Import from shared
import config from '../config';

// Extend the shared interface to add Mongoose Document properties and methods
export interface IUser extends ISharedUser, Omit<Document, '_id'> {
  password?: string;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpires?: Date;
  comparePassword(password: string): Promise<boolean>;
  createEmailVerificationToken(): string;
  createPasswordResetToken(): string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    roles: {
      type: [String],
      enum: Object.values(USER_ROLES),
      default: [USER_ROLES.USER],
    },
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationTokenExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    this.password = await argon2.hash(this.password, config.argon);
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return argon2.verify(this.password, candidatePassword);
};

UserSchema.methods.createEmailVerificationToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return token;
};

UserSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return resetToken;
};

export const User = mongoose.model<IUser>('User', UserSchema);