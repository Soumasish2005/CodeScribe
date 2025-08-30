// packages/shared/src/types/index.d.ts
import { Request } from 'express';
import { IUser } from '../../../api/src/models/user.model'; // Adjust path based on your setup

declare global {
  namespace Express {
    export interface Request {
      user?: IUser | null;
      id?: string; // for request tracing
    }
  }
}

export type UserRole = 'user' | 'admin';

export type BlogStatus = 'draft' | 'pending' | 'published' | 'rejected';
