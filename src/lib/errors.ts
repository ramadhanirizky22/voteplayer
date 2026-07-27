export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(
    message: string,
    public readonly details: Record<string, unknown> = {}
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly errorCode = 'VALIDATION_ERROR';
}

export class AuthenticationError extends AppError {
  readonly statusCode = 401;
  readonly errorCode = 'UNAUTHENTICATED';
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly errorCode = 'FORBIDDEN';
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly errorCode = 'NOT_FOUND';
}

export class RateLimitError extends AppError {
  readonly statusCode = 429;
  readonly errorCode = 'TOO_MANY_REQUESTS';
}

export class InternalServerError extends AppError {
  readonly statusCode = 500;
  readonly errorCode = 'INTERNAL_SERVER_ERROR';
}
