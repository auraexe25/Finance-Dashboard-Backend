export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const createBadRequestError = (message: string, details?: unknown): ApiError => {
  return new ApiError(400, message, details);
};

export const createUnauthorizedError = (message: string): ApiError => {
  return new ApiError(401, message);
};

export const createForbiddenError = (message: string): ApiError => {
  return new ApiError(403, message);
};

export const createNotFoundError = (message: string): ApiError => {
  return new ApiError(404, message);
};
