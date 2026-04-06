import { Request, Response } from 'express';
import Category from '../models/Category';
import { asyncHandler } from '../utils/asyncHandler';
import { createBadRequestError, createNotFoundError } from '../utils/errors';
import { ensureNonEmptyString, ensureOptionalString } from '../utils/validation';

interface CreateCategoryBody {
  name: unknown;
  description?: unknown;
  color?: unknown;
  icon?: unknown;
}

interface UpdateCategoryBody {
  name?: unknown;
  description?: unknown;
  color?: unknown;
  icon?: unknown;
}

interface CategoryParams {
  id: string;
}

export const createCategory = asyncHandler(async (req: Request<{}, {}, CreateCategoryBody>, res: Response) => {
  const name = ensureNonEmptyString(req.body.name, 'name');
  const description = ensureOptionalString(req.body.description, 'description');
  const color = ensureOptionalString(req.body.color, 'color');
  const icon = ensureOptionalString(req.body.icon, 'icon');

  if (!req.user) {
    throw createBadRequestError('Authenticated user context is missing');
  }

  const existingCategory = await Category.findOne({
    createdBy: req.user.id,
    name: { $regex: `^${name}$`, $options: 'i' }
  });

  if (existingCategory) {
    throw createBadRequestError('Category with this name already exists');
  }

  const category = await Category.create({
    name,
    description,
    color: color || '#6366f1',
    icon,
    createdBy: req.user.id,
    isSystem: false
  });

  res.status(201).json({
    message: 'Category created successfully',
    category
  });
});

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequestError('Authenticated user context is missing');
  }

  const categories = await Category.find({
    $or: [
      { createdBy: req.user.id },
      { isSystem: true }
    ]
  }).sort({ name: 1 });

  res.status(200).json({
    count: categories.length,
    categories
  });
});

export const getCategoryById = asyncHandler(async (req: Request<CategoryParams>, res: Response) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw createNotFoundError('Category not found');
  }

  if (!req.user) {
    throw createBadRequestError('Authenticated user context is missing');
  }

  if (category.createdBy.toString() !== req.user.id && !category.isSystem) {
    throw createNotFoundError('Category not found');
  }

  res.status(200).json({ category });
});

export const updateCategory = asyncHandler(async (req: Request<CategoryParams, {}, UpdateCategoryBody>, res: Response) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw createNotFoundError('Category not found');
  }

  if (!req.user) {
    throw createBadRequestError('Authenticated user context is missing');
  }

  if (category.createdBy.toString() !== req.user.id) {
    throw createNotFoundError('Category not found');
  }

  if (category.isSystem) {
    throw createBadRequestError('Cannot modify system categories');
  }

  const updatePayload: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
  } = {};

  if (req.body.name !== undefined) {
    updatePayload.name = ensureNonEmptyString(req.body.name, 'name');
  }

  if (req.body.description !== undefined) {
    updatePayload.description = ensureOptionalString(req.body.description, 'description');
  }

  if (req.body.color !== undefined) {
    updatePayload.color = ensureOptionalString(req.body.color, 'color');
  }

  if (req.body.icon !== undefined) {
    updatePayload.icon = ensureOptionalString(req.body.icon, 'icon');
  }

  if (Object.keys(updatePayload).length === 0) {
    throw createBadRequestError('No valid fields to update');
  }

  const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updatePayload, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    message: 'Category updated successfully',
    category: updatedCategory
  });
});

export const deleteCategory = asyncHandler(async (req: Request<CategoryParams>, res: Response) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw createNotFoundError('Category not found');
  }

  if (!req.user) {
    throw createBadRequestError('Authenticated user context is missing');
  }

  if (category.createdBy.toString() !== req.user.id) {
    throw createNotFoundError('Category not found');
  }

  if (category.isSystem) {
    throw createBadRequestError('Cannot delete system categories');
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: 'Category deleted successfully' });
});
