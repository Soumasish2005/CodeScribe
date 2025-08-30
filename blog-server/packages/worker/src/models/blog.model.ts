// packages/worker/src/models/blog.model.ts
// The worker needs its own reference to the models it interacts with.
// This is a direct copy from the `api` package.
// In a monorepo, this could be a shared package.
import mongoose, { Schema, Document, Types } from 'mongoose';
import { BLOG_STATUS } from '@devnovate/shared/constants';
import { BlogStatus } from '@devnovate/shared/types';

export interface IBlog extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  status: BlogStatus;
  likeCount: number;
  viewCount: number;
  commentCount: number;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String },
    content: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: Object.values(BLOG_STATUS),
    },
    likeCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);
