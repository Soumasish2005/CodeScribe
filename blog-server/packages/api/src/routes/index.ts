// packages/api/src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import blogRoutes from './blog.routes';
import userRoutes from './user.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/blogs', blogRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

export default router;
