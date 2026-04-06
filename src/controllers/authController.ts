import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { JwtPayload } from '../types/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { createBadRequestError, createForbiddenError, createUnauthorizedError } from '../utils/errors';
import { ensureEmail, ensureNonEmptyString } from '../utils/validation';

interface RegisterBody {
  name: unknown;
  email: unknown;
  password: unknown;
}

interface LoginBody {
  email: unknown;
  password: unknown;
}

const signToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createUnauthorizedError('JWT secret is not configured');
  }
  return jwt.sign(payload, secret, { expiresIn: '1d' });
};

export const register = asyncHandler(async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const name = ensureNonEmptyString(req.body.name, 'name');
  const email = ensureEmail(req.body.email);
  const password = ensureNonEmptyString(req.body.password, 'password');

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
    role: 'Viewer',
    status: 'Active',
    balance: 0,
    lastBalanceUpdate: new Date()
  });

  const token = signToken({
    sub: user.id,
    role: user.role,
    status: user.status
  });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }
  });
});

export const login = asyncHandler(async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const email = ensureEmail(req.body.email);
  const password = ensureNonEmptyString(req.body.password, 'password');

  const user = await User.findOne({ email });
  if (!user) {
    throw createUnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw createUnauthorizedError('Invalid email or password');
  }

  if (user.status !== 'Active') {
    throw createForbiddenError('User account is inactive');
  }

  const token = signToken({
    sub: user.id,
    role: user.role,
    status: user.status
  });

  res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createUnauthorizedError('Authentication is required');
  }

  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) {
    throw createUnauthorizedError('User not found');
  }

  res.status(200).json({ user });
});
