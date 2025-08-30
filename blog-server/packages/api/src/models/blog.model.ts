// packages/api/src/models/blog.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import { BLOG_STATUS } from '@devnovate/shared/constants';
import { BlogStatus } from '@devnovate/shared/types';

export interface IBlog extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  status: BlogStatus;
  tags: string[];
  likeCount: number;
  viewCount: number;
  commentCount: number;
  publishedAt?: Date;
  rejectionReason?: string;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: Object.values(BLOG_STATUS),
      default: BLOG_STATUS.DRAFT,
      index: true,
    },
    tags: [{ type: String, trim: true }],
    likeCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    publishedAt: { type: Date, index: true },
    rejectionReason: { type: String },
  },
  {
    timestamps: true,
    versionKey: 'version', // Enable optimistic concurrency
  }
);

BlogSchema.index({ title: 'text', content: 'text', tags: 'text' });
BlogSchema.index({ author: 1, status: 1 });

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);
