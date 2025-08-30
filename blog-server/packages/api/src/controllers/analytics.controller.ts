// packages/api/src/controllers/analytics.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Blog } from '../models/blog.model';
import { User } from '../models/user.model';
import { ApiResponse } from '../utils/apiResponse';

export class AnalyticsController {
  public getOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalBlogs = Blog.countDocuments();
      const totalUsers = User.countDocuments();
      const totalLikes = Blog.aggregate([{ $group: { _id: null, total: { $sum: '$likeCount' } } }]);
      const totalViews = Blog.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]);

      const [blogs, users, likes, views] = await Promise.all([totalBlogs, totalUsers, totalLikes, totalViews]);

      const overview = {
        totalBlogs: blogs,
        totalUsers: users,
        totalLikes: likes[0]?.total || 0,
        totalViews: views[0]?.total || 0,
      };

      res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, 'Analytics overview fetched successfully', overview));
    } catch (error) {
      next(error);
    }
  };

  public getBlogAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blogId = req.params.id;
      const blog = await Blog.findById(blogId).select('likeCount viewCount commentCount').lean();

      if (!blog) {
        return res.status(StatusCodes.NOT_FOUND).json(new ApiResponse(StatusCodes.NOT_FOUND, 'Blog not found'));
      }

      res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, 'Blog analytics fetched successfully', blog));
    } catch (error) {
      next(error);
    }
  };
}
