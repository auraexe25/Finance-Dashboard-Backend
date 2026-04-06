import {
  ApiError,
  createBadRequestError,
  createUnauthorizedError,
  createForbiddenError,
  createNotFoundError
} from '../utils/errors';

describe('Error Utilities', () => {
  describe('ApiError', () => {
    it('should create error with status code', () => {
      const error = new ApiError(400, 'Test error');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test error');
    });

    it('should include details if provided', () => {
      const error = new ApiError(400, 'Test error', { field: 'email' });
      expect(error.details).toEqual({ field: 'email' });
    });

    it('should be instanceof Error', () => {
      const error = new ApiError(400, 'Test error');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('createBadRequestError', () => {
    it('should create 400 error', () => {
      const error = createBadRequestError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('should support details parameter', () => {
      const error = createBadRequestError('Invalid input', { field: 'email' });
      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('createUnauthorizedError', () => {
    it('should create 401 error', () => {
      const error = createUnauthorizedError('Missing token');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Missing token');
    });
  });

  describe('createForbiddenError', () => {
    it('should create 403 error', () => {
      const error = createForbiddenError('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
    });
  });

  describe('createNotFoundError', () => {
    it('should create 404 error', () => {
      const error = createNotFoundError('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });
  });
});
