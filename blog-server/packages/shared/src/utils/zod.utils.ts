// packages/shared/src/utils/zod.utils.ts
import { z } from 'zod';

// This allows us to use Zod schemas as DTO classes
export const createZodDto = <T extends z.ZodTypeAny>(schema: T) => schema;
