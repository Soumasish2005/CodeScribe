// packages/shared/src/dtos/blog.dto.ts
import { z } from 'zod';
import { BLOG_STATUS } from '../constants';

const blogStatusValues = Object.values(BLOG_STATUS) as [string, ...string[]];

export const CreateBlogSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(50),
  tags: z.array(z.string()).optional(),
});
export class CreateBlogDto {
  title: string;
  content: string;
  tags?: string[];

  constructor(data: { title: string; content: string; tags?: string[] }) {
    this.title = data.title;
    this.content = data.content;
    this.tags = data.tags;
  }
}

export const UpdateBlogSchema = CreateBlogSchema.partial();
export class UpdateBlogDto {
  title?: string;
  content?: string;
  tags?: string[];

  constructor(data: Partial<{ title: string; content: string; tags?: string[] }>) {
    const parsedData = UpdateBlogSchema.parse(data);
    this.title = parsedData.title;
    this.content = parsedData.content;
    this.tags = parsedData.tags;
  }
}

export const SearchBlogSchema = z.object({
  q: z.string().optional(),
  tags: z.string().optional(),
  author: z.string().optional(),
  status: z.enum(blogStatusValues).optional(),
  sort: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
export class SearchBlogDto {
  q?: string;
  tags?: string;
  author?: string;
  status?: string;
  sort?: string;
  page: number;
  limit: number;

  constructor(data: unknown) {
    const parsedData = SearchBlogSchema.parse(data);
    this.q = parsedData.q;
    this.tags = parsedData.tags;
    this.author = parsedData.author;
    this.status = parsedData.status;
    this.sort = parsedData.sort;
    this.page = parsedData.page;
    this.limit = parsedData.limit;
  }
}

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(1000),
});
export class CreateCommentDto {
  content: string;

  constructor(data: { content: string }) {
    const parsedData = CreateCommentSchema.parse(data);
    this.content = parsedData.content;
  }
}

export const RejectBlogSchema = z.object({
  rejectionReason: z.string().min(10).max(500),
});
export class RejectBlogDto {
  rejectionReason: string;

  constructor(data: { rejectionReason: string }) {
    const parsedData = RejectBlogSchema.parse(data);
    this.rejectionReason = parsedData.rejectionReason;
  }
}
