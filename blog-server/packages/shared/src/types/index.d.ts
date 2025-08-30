// packages/shared/src/types/index.d.ts
import { Types } from 'mongoose';

// Define the core User interface here. It has no knowledge of Mongoose methods.
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  roles: UserRole[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    export interface Request {
      user?: IUser | null; // This now correctly refers to the interface above
      id?: string; // for request tracing
    }
  }
}

export type UserRole = 'user' | 'admin';
export type BlogStatus = 'draft' | 'pending' | 'published' | 'rejected';
