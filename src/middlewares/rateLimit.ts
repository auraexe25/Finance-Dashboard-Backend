import { RequestHandler } from 'express';
import { createBadRequestError } from '../utils/errors';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

export const rateLimit = (windowMs: number, maxRequests: number): RequestHandler => {
  return (req, _res, next) => {
    const clientId = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let entry = store.get(clientId);

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + windowMs
      };
      store.set(clientId, entry);
      next();
      return;
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      const error = createBadRequestError(`Too many requests. Retry after ${retryAfter} seconds`);
      next(error);
      return;
    }

    next();
  };
};
