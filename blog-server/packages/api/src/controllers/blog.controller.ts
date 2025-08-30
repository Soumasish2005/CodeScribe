// packages/api/src/controllers/blog.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BlogService } from '../services/blog.service';
import { Types } from 'mongoose';
import { ApiResponse } from '../utils/apiResponse';
import {
  CreateBlogDto,
  UpdateBlogDto,
  SearchBlogDto,
  CreateCommentDto,
  RejectBlogDto,
} from '@devnovate/shared/dtos/blog.dto';

export class BlogController {
  constructor(private blogService: BlogService) {}

  public createBlog = async (
    req: Request<Record<string, never>, any, CreateBlogDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authorId = req.user!._id as Types.ObjectId;
      const blog = await this.blogService.createBlog(req.body, authorId, req.file);
      res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, 'Blog created successfully', blog));
    } catch (error) {
      next(error);
    }
  };

  public submitBlog = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const blog = await this.blogService.submitBlog(req.params.id, req.user!._id as Types.ObjectId);
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Blog submitted for approval', blog));
    } catch (error) {
      next(error);
    }
  };

  public getBlogById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      // Pass the optional req.user to allow the service to handle permissions
      const blog = await this.blogService.getBlogById(req.params.id, req.user);
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Blog fetched successfully', blog));
    } catch (error) {
      next(error);
    }
  };

  public updateBlog = async (req: Request<{ id: string }, any, UpdateBlogDto>, res: Response, next: NextFunction) => {
    try {
      const blog = await this.blogService.updateBlog(req.params.id, req.body, req.user!._id as Types.ObjectId);
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Blog updated successfully', blog));
    } catch (error) {
      next(error);
    }
  };

  public searchBlogs = async (
    req: Request<Record<string, never>, any, Record<string, never>, SearchBlogDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.blogService.searchBlogs(req.query);
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Blogs fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  public getTrendingBlogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { window = '24h', limit = 10 } = req.query;
      const blogs = await this.blogService.getTrendingBlogs(window as string, Number(limit));
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Trending blogs fetched', blogs));
    } catch (error) {
      next(error);
    }
  };

  public likeBlog = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      await this.blogService.likeBlog(req.params.id, req.user!._id as Types.ObjectId);
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Like event queued'));
    } catch (error) {
      next(error);
    }
  };

  public unlikeBlog = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      await this.blogService.unlikeBlog(req.params.id, req.user!._id as Types.ObjectId);
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Unlike event queued'));
    } catch (error) {
      next(error);
    }
  };

  public addComment = async (
    req: Request<{ id: string }, unknown, CreateCommentDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const comment = await this.blogService.addComment(req.params.id, req.user!._id as Types.ObjectId, req.body);
      res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, 'Comment added', comment));
    } catch (error) {
      next(error);
    }
  };

  // Admin Actions
  public approveBlog = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const blog = await this.blogService.approveBlog(req.params.id);
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Blog approved and published', blog));
    } catch (error) {
      next(error);
    }
  };

  public rejectBlog = async (req: Request<{ id: string }, any, RejectBlogDto>, res: Response, next: NextFunction) => {
    try {
      const blog = await this.blogService.rejectBlog(req.params.id, req.body.rejectionReason);
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Blog rejected', blog));
    } catch (error) {
      next(error);
    }
  };

  public deleteBlog = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      await this.blogService.deleteBlog(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
  public getAllBlogsAsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.blogService.searchAllBlogsAsAdmin(req.query as unknown as SearchBlogDto);
      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'All blogs fetched for admin', result));
    } catch (error) {
      next(error);
    }
  };
}
