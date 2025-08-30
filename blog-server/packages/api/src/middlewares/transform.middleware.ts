// packages/api/src/middlewares/transform.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const transformTags = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body.tags === 'string') {
    // Split the string by commas, trim whitespace from each tag, and filter out any empty strings
    interface TagsRequestBody {
      tags: string;
    }

    interface TagsTransformedRequestBody {
      tags: string[];
    }

    const body = req.body as TagsRequestBody;
    const transformedBody = body as unknown as TagsTransformedRequestBody;

    transformedBody.tags = body.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    req.body = transformedBody;
  }
  next();
};
