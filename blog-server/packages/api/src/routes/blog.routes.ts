// packages/api/src/routes/blog.routes.ts
import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller';
import { BlogService } from '../services/blog.service';
import { OutboxService } from '../services/outbox.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbacMiddleware } from '../middlewares/rbac.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  CreateBlogSchema,
  CreateCommentSchema,
  RejectBlogSchema,
  SearchBlogSchema,
  UpdateBlogSchema,
} from '@devnovate/shared/dtos/blog.dto';
import { USER_ROLES } from '@devnovate/shared/constants';
import { idempotencyMiddleware } from '../middlewares/idempotency.middleware';
import { transformTags } from '../middlewares/transform.middleware';

const router = Router();
const outboxService = new OutboxService();
const blogService = new BlogService(outboxService);
const blogController = new BlogController(blogService);

// Public routes
router.get('/search', blogController.searchBlogs);
router.get('/trending', blogController.getTrendingBlogs);
router.get('/:id', blogController.getBlogById);

// Authenticated user routes
router.use(authMiddleware);

router.post(
  '/',
  idempotencyMiddleware,
  upload.single('coverImage'),
  transformTags,
  validateBody(CreateBlogSchema),
  blogController.createBlog
);
router.patch(
  '/:id',
  upload.single('coverImage'),
  transformTags,
  validateBody(UpdateBlogSchema),
  blogController.updateBlog
);
router.post('/:id/submit', blogController.submitBlog);

router.post('/:id/like', blogController.likeBlog);
router.post('/:id/unlike', blogController.unlikeBlog);
router.post('/:id/comments', validateBody(CreateCommentSchema), blogController.addComment);

// Admin routes
router.post('/admin/:id/approve', rbacMiddleware([USER_ROLES.ADMIN]), blogController.approveBlog);
router.post(
  '/admin/:id/reject',
  rbacMiddleware([USER_ROLES.ADMIN]),
  validateBody(RejectBlogSchema),
  blogController.rejectBlog
);
router.delete('/admin/:id', rbacMiddleware([USER_ROLES.ADMIN]), blogController.deleteBlog);
router.get(
  '/admin/all',
  rbacMiddleware([USER_ROLES.ADMIN]),
  validateBody(SearchBlogSchema),
  blogController.getAllBlogsAsAdmin
);

export default router;
