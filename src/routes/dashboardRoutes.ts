import { Router } from 'express';
import {
  getCategoryBreakdown,
  getDashboardSummary,
  getMonthlyTrends,
  getRecentActivity
} from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();

router.use(authenticate, authorize('Viewer', 'Analyst', 'Admin'));

router.get('/summary', getDashboardSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/recent', getRecentActivity);
router.get('/trends/monthly', getMonthlyTrends);

export default router;
