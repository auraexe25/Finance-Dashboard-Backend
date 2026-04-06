import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { createBadRequestError, createNotFoundError } from '../utils/errors';
import { ensureEmail, ensureNonEmptyString, ensureOptionalString, ensureUserRole, ensureUserStatus } from '../utils/validation';

interface CreateUserBody {
  name: unknown;
  email: unknown;
  password: unknown;
  role: unknown;
  status?: unknown;
}

interface UpdateUserBody {
  name?: unknown;
  role?: unknown;
  status?: unknown;
  password?: unknown;
}

interface UserIdParams {
  id: string;
}

export const createUser = asyncHandler(async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
  const name = ensureNonEmptyString(req.body.name, 'name');
  const email = ensureEmail(req.body.email);
  const password = ensureNonEmptyString(req.body.password, 'password');
  const role = ensureUserRole(req.body.role);
  const status = req.body.status === undefined ? 'Active' : ensureUserStatus(req.body.status);

  if (password.length < 8) {
    throw createBadRequestError('password must be at least 8 characters long');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createBadRequestError('Email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    status
  });

  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }
  });
});

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.status(200).json({ count: users.length, users });
});

export const getUserById = asyncHandler(async (req: Request<UserIdParams>, res: Response) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) {
    throw createNotFoundError('User not found');
  }

  res.status(200).json({ user });
});

export const updateUser = asyncHandler(async (req: Request<UserIdParams, {}, UpdateUserBody>, res: Response) => {
  const updatePayload: {
    name?: string;
    role?: 'Viewer' | 'Analyst' | 'Admin';
    status?: 'Active' | 'Inactive';
    passwordHash?: string;
  } = {};

  if (req.body.name !== undefined) {
    updatePayload.name = ensureOptionalString(req.body.name, 'name');
  }

  if (req.body.role !== undefined) {
    updatePayload.role = ensureUserRole(req.body.role);
  }

  if (req.body.status !== undefined) {
    updatePayload.status = ensureUserStatus(req.body.status);
  }

  if (req.body.password !== undefined) {
    const password = ensureNonEmptyString(req.body.password, 'password');
    if (password.length < 8) {
      throw createBadRequestError('password must be at least 8 characters long');
    }
    updatePayload.passwordHash = await bcrypt.hash(password, 12);
  }

  if (Object.keys(updatePayload).length === 0) {
    throw createBadRequestError('No valid fields to update');
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, updatePayload, {
    new: true,
    runValidators: true
  }).select('-passwordHash');

  if (!updatedUser) {
    throw createNotFoundError('User not found');
  }

  res.status(200).json({
    message: 'User updated successfully',
    user: updatedUser
  });
});

export const deleteUser = asyncHandler(async (req: Request<UserIdParams>, res: Response) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) {
    throw createNotFoundError('User not found');
  }

  res.status(200).json({ message: 'User deleted successfully' });
});

export const getUserBalance = asyncHandler(async (req: Request<UserIdParams>, res: Response) => {
  const user = await User.findById(req.params.id).select('balance lastBalanceUpdate');
  if (!user) {
    throw createNotFoundError('User not found');
  }

  res.status(200).json({
    userId: user.id,
    balance: user.balance,
    lastBalanceUpdate: user.lastBalanceUpdate
  });
});
