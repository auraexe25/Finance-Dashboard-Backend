import { NextFunction, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { createBadRequestError } from '../utils/errors';

export const validateObjectIdParam = <P extends Record<string, string>>(paramName: keyof P) => {
  const middleware: RequestHandler<P> = (req, _res, next: NextFunction): void => {
    const paramValue = req.params[paramName];
    if (typeof paramValue !== 'string' || !mongoose.Types.ObjectId.isValid(paramValue)) {
      next(createBadRequestError(`${String(paramName)} must be a valid ObjectId`));
      return;
    }
    next();
  };

  return middleware;
};
