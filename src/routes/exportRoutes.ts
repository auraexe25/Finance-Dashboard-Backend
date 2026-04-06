import { Router } from 'express';
import { exportRecordsCSV, exportRecordsJSON } from '../controllers/exportController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();

router.use(authenticate, authorize('Analyst', 'Admin'));

router.get('/csv', exportRecordsCSV);
router.get('/json', exportRecordsJSON);

export default router;
