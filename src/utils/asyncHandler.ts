import { NextFunction, RequestHandler } from 'express';

export const asyncHandler = <
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown,
  Locals extends Record<string, unknown> = Record<string, unknown>
>(
  controller: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> => {
  return (req, res, next: NextFunction): void => {
    void Promise.resolve(controller(req, res, next)).catch(next);
  };
};
