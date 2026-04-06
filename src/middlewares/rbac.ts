import { NextFunction, RequestHandler } from 'express';
import { UserRole } from '../types/domain';
import { createForbiddenError, createUnauthorizedError } from '../utils/errors';

export const authorize = (...allowedRoles: UserRole[]) => {
  const middleware: RequestHandler = (req, _res, next: NextFunction): void => {
    const authenticatedUser = req.user;
    if (!authenticatedUser) {
      next(createUnauthorizedError('Authentication is required'));
      return;
    }

    if (!allowedRoles.includes(authenticatedUser.role)) {
      next(createForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };

  return middleware;
};
