import { Router } from 'express';
import { getDashboardWithBalance, getUsersBalanceReport } from '../controllers/balanceController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();

router.use(authenticate, authorize('Viewer', 'Analyst', 'Admin'));

router.get('/summary', getDashboardWithBalance);
router.get('/users/report', authorize('Admin'), getUsersBalanceReport);

export default router;
