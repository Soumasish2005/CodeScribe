// packages/shared/src/events/index.ts
import { INTERACTION_TYPES } from '../constants';

type InteractionType = (typeof INTERACTION_TYPES)[keyof typeof INTERACTION_TYPES];

export interface InteractionEventPayload {
  type: InteractionType;
  userId: string;
  blogId: string;
  timestamp: number;
}

export interface AnalyticsEventPayload {
  type: 'VIEW';
  blogId: string;
  userId?: string; // Optional for anonymous views
  ipAddress: string;
  userAgent: string;
  timestamp: number;
}
