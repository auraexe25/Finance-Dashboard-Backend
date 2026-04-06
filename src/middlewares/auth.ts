import { NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { JwtPayload } from '../types/auth';
import { createForbiddenError, createUnauthorizedError } from '../utils/errors';

const getTokenFromHeader = (authorizationHeader?: string): string => {
  if (!authorizationHeader) {
    throw createUnauthorizedError('Authorization header is required');
  }
  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw createUnauthorizedError('Authorization header must be Bearer token');
  }
  return token;
};

export const authenticate: RequestHandler = async (req, _res, next: NextFunction): Promise<void> => {
  try {
    const token = getTokenFromHeader(req.headers.authorization);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw createUnauthorizedError('JWT secret is not configured');
    }

    const payload = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(payload.sub).select('_id role status');

    if (!user) {
      throw createUnauthorizedError('User not found');
    }

    if (user.status !== 'Active') {
      throw createForbiddenError('User account is inactive');
    }

    req.user = {
      id: user.id,
      role: user.role,
      status: user.status
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createUnauthorizedError('Invalid token'));
      return;
    }
    next(error);
  }
};
