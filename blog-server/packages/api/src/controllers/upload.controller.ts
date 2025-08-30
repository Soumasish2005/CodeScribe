// packages/api/src/controllers/upload.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UploadService } from '../services/upload.service';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  public uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'No image file uploaded');
      }
      const imageUrl = await this.uploadService.uploadPublicFile(req.file);
      res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, 'Image uploaded successfully', { url: imageUrl }));
    } catch (error) {
      next(error);
    }
  };
}
