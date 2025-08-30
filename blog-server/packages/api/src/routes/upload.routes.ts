// packages/api/src/routes/upload.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { UploadController } from '../controllers/upload.controller';

const router = Router();
const uploadController = new UploadController();

// A dedicated endpoint for uploading any image
router.post('/image', authMiddleware, upload.single('image'), uploadController.uploadImage);

export default router;
