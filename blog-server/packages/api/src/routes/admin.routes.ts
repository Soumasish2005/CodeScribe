// packages/api/src/routes/admin.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbacMiddleware } from '../middlewares/rbac.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { USER_ROLES } from '@devnovate/shared/constants';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { AdminCreateUserSchema } from '@devnovate/shared/dtos/user.dto';
import { BlogController } from '../controllers/blog.controller';
import { BlogService } from '../services/blog.service';
import { OutboxService } from '../services/outbox.service';

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);
const outboxService = new OutboxService();
const blogService = new BlogService(outboxService);
const blogController = new BlogController(blogService); // Reuse UserController for blog-related admin tasks

// Protect all routes in this file
router.use(authMiddleware, rbacMiddleware([USER_ROLES.ADMIN]));

router.get('/blogs/unpublished', blogController.getUnpublishedBlogs);

// Define the route
router.post('/users', validateBody(AdminCreateUserSchema), userController.createUserByAdmin);

export default router;
