import { ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/errors';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null
    });
    return;
  }

  const message = error instanceof Error ? error.message : 'Internal Server Error';
  res.status(500).json({
    message,
    details: null
  });
};
