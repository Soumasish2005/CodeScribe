// packages/api/src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { validateBody } from '../middlewares/validate.middleware';
import {
  RegisterUserSchema,
  LoginUserSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '@devnovate/shared/dtos/auth.dto';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post('/register', validateBody(RegisterUserSchema), authController.register);
router.post('/login', validateBody(LoginUserSchema), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh', authController.refresh);

router.get('/verify/:token', authController.verifyEmail);
router.post('/forgot-password', validateBody(ForgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', validateBody(ResetPasswordSchema), authController.resetPassword);

export default router;
