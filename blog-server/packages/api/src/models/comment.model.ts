// packages/api/src/models/comment.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;
  blog: Types.ObjectId;
}

const CommentSchema: Schema = new Schema(
  {
    content: { type: String, required: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
  },
  { timestamps: true }
);

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
