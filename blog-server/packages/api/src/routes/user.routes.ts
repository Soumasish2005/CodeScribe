// packages/api/src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { UpdateUserSchema } from '@devnovate/shared/dtos/user.dto';

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

// All routes in this file are protected and require a valid token
router.use(authMiddleware);

router.get('/me', userController.getMyProfile);
router.patch('/me/profile', validateBody(UpdateUserSchema), userController.updateMyProfile);

export default router;
