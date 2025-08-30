// packages/api/src/models/outbox.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IOutbox extends Document {
  topic: string;
  key: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  retries: number;
  createdAt: Date;
  processedAt?: Date;
}

const OutboxSchema: Schema = new Schema({
  topic: { type: String, required: true, index: true },
  key: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['PENDING', 'PROCESSED', 'FAILED'], default: 'PENDING', index: true },
  retries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: '30d' }, // Automatically cleanup old processed messages
  processedAt: { type: Date },
});

export const Outbox = mongoose.model<IOutbox>('Outbox', OutboxSchema);
