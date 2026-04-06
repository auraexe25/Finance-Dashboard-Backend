import { Router } from 'express';
import {
  createRecord,
  deleteRecord,
  getRecordById,
  listRecords,
  updateRecord
} from '../controllers/recordController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import { validateObjectIdParam } from '../middlewares/validateObjectId';

type RecordIdParams = {
  id: string;
};

const router = Router();

router.use(authenticate);

router.get('/', authorize('Analyst', 'Admin'), listRecords);
router.get<RecordIdParams>('/:id', authorize('Analyst', 'Admin'), validateObjectIdParam<RecordIdParams>('id'), getRecordById);
router.post('/', authorize('Admin'), createRecord);
router.patch<RecordIdParams>('/:id', authorize('Admin'), validateObjectIdParam<RecordIdParams>('id'), updateRecord);
router.delete<RecordIdParams>('/:id', authorize('Admin'), validateObjectIdParam<RecordIdParams>('id'), deleteRecord);

export default router;
