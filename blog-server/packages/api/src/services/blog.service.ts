// packages/api/src/services/blog.service.ts
import mongoose, { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';

import { Blog, IBlog } from '../models/blog.model';
import { Comment } from '../models/comment.model';
import { OutboxService } from './outbox.service';
import { ApiError } from '../utils/apiError';
import { redisClient } from '../redis';
import { BLOG_STATUS, INTERACTION_TYPES, KAFKA_TOPICS, USER_ROLES } from '@devnovate/shared/constants';
import { CreateBlogDto, UpdateBlogDto, SearchBlogDto, CreateCommentDto } from '@devnovate/shared/dtos/blog.dto';
import { BlogStatus } from '@devnovate/shared/types';
import { IUser as ISharedUser } from '@devnovate/shared/types';
import { UploadService } from './upload.service';

// Setup for server-side HTML sanitization against XSS
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as unknown as Window & typeof globalThis);

export class BlogService {
  private uploadService = new UploadService();
  constructor(private outboxService: OutboxService) {
    this.uploadService = new UploadService();
  }

  /**
   * Creates a new blog post as a draft.
   */
  public async createBlog(
    blogData: CreateBlogDto,
    authorId: Types.ObjectId,
    file?: Express.Multer.File
  ): Promise<IBlog> {
    let coverImageKey: string | undefined;
    if (file) {
      coverImageKey = await this.uploadService.uploadFile(file);
    }
    const { title, content, tags } = blogData;

    // Sanitize Markdown content before saving to prevent XSS
    const parsedContent = await marked.parse(content);
    const sanitizedContent = DOMPurify.sanitize(parsedContent);

    const blog = new Blog({
      title,
      content: sanitizedContent,
      tags,
      author: authorId,
      status: BLOG_STATUS.DRAFT,
      coverImageKey,
    });

    await blog.save();
    return blog;
  }

  /**
   * Submits a draft blog for admin approval.
   */
  public async submitBlog(blogId: string, authorId: Types.ObjectId): Promise<IBlog> {
    const blog = await Blog.findById(blogId);

    if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Blog not found');
    if (blog.author !== authorId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not the author of this blog');
    }
    if (blog.status !== BLOG_STATUS.DRAFT) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Only draft blogs can be submitted for approval');
    }

    blog.status = BLOG_STATUS.PENDING;
    await blog.save();
    return blog as IBlog;
  }

  /**
   * Updates an existing blog post. Only accessible by the author for drafts or pending posts.
   */
  public async updateBlog(
    blogId: string,
    updateData: UpdateBlogDto,
    authorId: Types.ObjectId,
    file?: Express.Multer.File
  ): Promise<IBlog> {
    const blog = await Blog.findById(blogId);

    if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Blog not found');
    if (blog.author !== authorId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not authorized to update this blog');
    }
    const editableStatuses: BlogStatus[] = [BLOG_STATUS.DRAFT, BLOG_STATUS.PENDING];
    if (!editableStatuses.includes(blog.status as BlogStatus)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Only drafts or pending blogs can be edited');
    }

    if (file) {
      // If an old image exists, delete it from S3 to prevent orphaned files
      if (blog.coverImageKey) {
        await this.uploadService.deleteFile(blog.coverImageKey);
      }
      blog.coverImageKey = await this.uploadService.uploadFile(file);
    }

    if (updateData.content) {
      const parsedContent = await marked.parse(updateData.content);
      updateData.content = DOMPurify.sanitize(parsedContent);
    }

    Object.assign(blog, updateData);
    await blog.save();
    return blog;
  }

  /**
   * Fetches a single blog post by its ID. It also queues a 'VIEW' event.
   * Only returns published posts unless the requester is the author or an admin.
   */
  public async getBlogById(blogId: string, currentUser?: ISharedUser | null): Promise<IBlog> {
    const blog = await Blog.findById(blogId).populate('author', 'name').lean();
    if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Blog not found');

    const isAuthor = currentUser?._id === blog.author._id;
    const isAdmin = currentUser?.roles.includes(USER_ROLES.ADMIN) ?? false;

    if (blog.status !== BLOG_STATUS.PUBLISHED && !isAuthor && !isAdmin) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to view this blog');
    }

    if (blog.coverImageKey) {
      (blog as any).coverImageUrl = await this.uploadService.getPresignedUrl(blog.coverImageKey);
    }

    // Asynchronously update view count via event to keep this endpoint fast
    const userIdForEvent = currentUser?._id;
    await this.outboxService.createEvent({
      topic: KAFKA_TOPICS.INTERACTIONS,
      key: blogId,
      payload: { type: INTERACTION_TYPES.VIEW, blogId, userId: userIdForEvent, timestamp: Date.now() },
    });

    return blog as IBlog;
  }

  /**
   * Searches, filters, and paginates blogs. Only returns published posts.
   */
  public async searchBlogs(queryParams: SearchBlogDto) {
    const { q, tags, author, sort, page, limit } = queryParams;
    const query: mongoose.FilterQuery<IBlog> = { status: BLOG_STATUS.PUBLISHED };

    if (q) query.$text = { $search: q };
    if (tags) query.tags = { $in: tags.split(',') };
    if (author) query.author = author;

    const sortOptions: { [key: string]: 1 | -1 } = sort
      ? { [sort.split(':')[0]]: sort.split(':')[1] === 'desc' ? -1 : 1 }
      : { publishedAt: -1 };

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query),
    ]);

    const blogsWithUrls = await Promise.all(
      blogs.map(async (blog) => {
        if (blog.coverImageKey) {
          (blog as any).coverImageUrl = await this.uploadService.getPresignedUrl(blog.coverImageKey);
        }
        return blog;
      })
    );

    return { data: blogsWithUrls, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Fetches trending blogs from Redis cache.
   */
  public async getTrendingBlogs(window: string, limit: number): Promise<any[]> {
    const validWindows = ['24h', '7d'];
    if (!validWindows.includes(window)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid trending window specified.');
    }

    const redisKey = `trending:${window}`;
    const trendingIds = await redisClient.zRange(redisKey, 0, limit - 1, { REV: true });
    if (trendingIds.length === 0) return [];
    // Fetch full blog details for the trending IDs
    const blogs = await Blog.find({ _id: { $in: trendingIds }, status: BLOG_STATUS.PUBLISHED })
      .populate('author', 'name')
      .lean();
    const blogsWithUrls = await Promise.all(
      blogs.map(async (blog) => {
        if (blog.coverImageKey) {
          (blog as any).coverImageUrl = await this.uploadService.getPresignedUrl(blog.coverImageKey);
        }
        return blog;
      })
    );
    // Preserve the order from Redis
    const blogMap = new Map(blogsWithUrls.map((b) => [b._id.toString(), b]));
    return trendingIds.map((id) => blogMap.get(id)).filter(Boolean);
  }

  /**
   * Queues a 'LIKE' event for a blog post.
   */
  public async likeBlog(blogId: string, userId: Types.ObjectId): Promise<void> {
    const blog = await Blog.findOne({ _id: blogId, status: BLOG_STATUS.PUBLISHED });
    if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Published blog not found');

    await this.outboxService.createEvent({
      topic: KAFKA_TOPICS.INTERACTIONS,
      key: `${userId}:${blogId}`, // Key ensures idempotency for user-post pairs
      payload: { type: INTERACTION_TYPES.LIKE, userId: userId.toString(), blogId, timestamp: Date.now() },
    });
  }

  /**
   * Queues an 'UNLIKE' event for a blog post.
   */
  public async unlikeBlog(blogId: string, userId: Types.ObjectId): Promise<void> {
    const blog = await Blog.findOne({ _id: blogId, status: BLOG_STATUS.PUBLISHED });
    if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Published blog not found');

    await this.outboxService.createEvent({
      topic: KAFKA_TOPICS.INTERACTIONS,
      key: `${userId}:${blogId}`,
      payload: { type: INTERACTION_TYPES.UNLIKE, userId: userId.toString(), blogId, timestamp: Date.now() },
    });
  }

  /**
   * Adds a comment to a blog post atomically.
   */
  public async addComment(blogId: string, authorId: Types.ObjectId, commentData: CreateCommentDto) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const blog = await Blog.findOne({ _id: blogId, status: BLOG_STATUS.PUBLISHED }).session(session);
      if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Published blog not found');

      const comment = new Comment({ content: commentData.content, author: authorId, blog: blogId });
      await comment.save({ session });

      blog.commentCount += 1;
      await blog.save({ session });

      await this.outboxService.createEvent(
        {
          topic: KAFKA_TOPICS.INTERACTIONS,
          key: (comment._id as string).toString(),
          payload: { type: INTERACTION_TYPES.COMMENT, userId: authorId.toString(), blogId, timestamp: Date.now() },
        },
        { session }
      );

      await session.commitTransaction();
      return comment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // --- Admin Methods ---

  /**
   * Approves a pending blog, changing its status to 'published'.
   */
  public async approveBlog(blogId: string): Promise<IBlog> {
    const blog = await Blog.findById(blogId);
    if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Blog not found');
    if (blog.status !== BLOG_STATUS.PENDING) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Blog is not pending approval');
    }

    blog.status = BLOG_STATUS.PUBLISHED;
    blog.publishedAt = new Date();
    await blog.save();
    return blog;
  }

  /**
   * Rejects a pending blog, changing its status to 'rejected'.
   */
  public async rejectBlog(blogId: string, reason: string): Promise<IBlog> {
    const blog = await Blog.findById(blogId);
    if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Blog not found');
    if (blog.status !== BLOG_STATUS.PENDING) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Blog is not pending approval');
    }

    blog.status = BLOG_STATUS.REJECTED;
    blog.rejectionReason = reason;
    await blog.save();
    return blog;
  }

  /**
   * Deletes a blog post permanently.
   */
  public async deleteBlog(blogId: string): Promise<void> {
    const blog = await Blog.findById(blogId);
    if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Blog not found');

    // In a real system, you might also delete associated comments, likes, etc.
    // or simply soft-delete the blog post.
    await Blog.findByIdAndDelete(blogId);
    await Comment.deleteMany({ blog: blogId });
  }

  // ... constructor and other methods

  public async searchAllBlogsAsAdmin(queryParams: SearchBlogDto) {
    const { q, tags, author, status, sort, page, limit } = queryParams;

    // The main query object. Notice it does NOT have a default status.
    const query: mongoose.FilterQuery<IBlog> = {};

    // If the admin provides a status filter in the query, we use it.
    // This allows them to filter for 'pending', 'draft', etc.
    if (status) {
      query.status = status;
    }

    if (q) query.$text = { $search: q };
    if (tags) query.tags = { $in: typeof tags === 'string' ? tags.split(',') : tags };
    if (author) query.author = author;

    const sortOptions: { [key: string]: 1 | -1 } = sort
      ? { [sort.split(':')[0]]: sort.split(':')[1] === 'desc' ? -1 : 1 }
      : { createdAt: -1 }; // Default sort by creation date

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query),
    ]);

    // Hydrate the list of blogs with their cover image URLs
    const blogsWithUrls = await Promise.all(
      blogs.map(async (blog) => {
        if (blog.coverImageKey) {
          (blog as any).coverImageUrl = await this.uploadService.getPresignedUrl(blog.coverImageKey);
        }
        return blog;
      })
    );

    return { data: blogsWithUrls, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
