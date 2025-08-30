// packages/api/src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import blogRoutes from './blog.routes';
import userRoutes from './user.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/blogs', blogRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
