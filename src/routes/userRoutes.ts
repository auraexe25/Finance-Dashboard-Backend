import { Router } from 'express';
import { createUser, deleteUser, getUserBalance, getUserById, listUsers, updateUser } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import { validateObjectIdParam } from '../middlewares/validateObjectId';

type UserIdParams = {
	id: string;
};

const router = Router();

router.use(authenticate, authorize('Admin'));

router.post('/', createUser);
router.get('/', listUsers);
router.get<UserIdParams>('/:id/balance', validateObjectIdParam<UserIdParams>('id'), getUserBalance);
router.get<UserIdParams>('/:id', validateObjectIdParam<UserIdParams>('id'), getUserById);
router.patch<UserIdParams>('/:id', validateObjectIdParam<UserIdParams>('id'), updateUser);
router.delete<UserIdParams>('/:id', validateObjectIdParam<UserIdParams>('id'), deleteUser);

export default router;
