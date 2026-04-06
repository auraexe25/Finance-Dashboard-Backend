import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory
} from '../controllers/categoryController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';
import { validateObjectIdParam } from '../middlewares/validateObjectId';

type CategoryIdParams = {
  id: string;
};

const router = Router();

router.use(authenticate);

router.post('/', createCategory);
router.get('/', listCategories);
router.get<CategoryIdParams>('/:id', validateObjectIdParam<CategoryIdParams>('id'), getCategoryById);
router.patch<CategoryIdParams>('/:id', validateObjectIdParam<CategoryIdParams>('id'), updateCategory);
router.delete<CategoryIdParams>('/:id', validateObjectIdParam<CategoryIdParams>('id'), deleteCategory);

export default router;
