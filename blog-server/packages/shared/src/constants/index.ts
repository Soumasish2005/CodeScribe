// packages/shared/src/constants/index.ts
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const BLOG_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
} as const;

export const KAFKA_TOPICS = {
  INTERACTIONS: 'interactions.events',
  NOTIFICATIONS: 'notifications.events',
  ANALYTICS: 'analytics.events',
  INTERACTIONS_DLQ: 'interactions.events.dlq',
} as const;

export const INTERACTION_TYPES = {
  LIKE: 'LIKE',
  UNLIKE: 'UNLIKE',
  VIEW: 'VIEW',
  COMMENT: 'COMMENT',
} as const;

export const TRENDING_WINDOWS = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
};
