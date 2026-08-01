export class ApiError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (code, message, details) =>
  new ApiError(400, code, message, details);
export const unauthorized = (code = 'NOT_AUTHENTICATED', message = 'Authentication is required.') =>
  new ApiError(401, code, message);
export const forbidden = (code = 'FORBIDDEN', message = 'You are not allowed to perform this action.') =>
  new ApiError(403, code, message);
export const notFound = (code = 'NOT_FOUND', message = 'The requested resource was not found.') =>
  new ApiError(404, code, message);
export const conflict = (code, message, details) => new ApiError(409, code, message, details);
export const tooManyRequests = (code, message, retryAfterSeconds) =>
  new ApiError(429, code, message, { retryAfterSeconds });

export function toErrorPayload(error) {
  const known = error instanceof ApiError;
  return {
    error: {
      code: known ? error.code : 'INTERNAL_ERROR',
      message: known ? error.message : 'An unexpected server error occurred.',
      ...(known && error.details !== undefined ? { details: error.details } : {})
    }
  };
}
