// packages/api/src/routes/analytics.routes.ts
import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbacMiddleware } from '../middlewares/rbac.middleware';
import { USER_ROLES } from '@devnovate/shared/constants';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authMiddleware, rbacMiddleware([USER_ROLES.ADMIN]));

router.get('/overview', analyticsController.getOverview);
router.get('/blogs/:id', analyticsController.getBlogAnalytics);

export default router;
