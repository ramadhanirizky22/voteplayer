import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiResponse } from '@/types';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public errorCode: string = 'BAD_REQUEST'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown): NextResponse<ApiResponse<null>> {
  console.error('[API_ERROR_LOG]:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: error.errorCode,
          message: error.message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid payload or query parameter formatting',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 422 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      data: null,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected server error occurred. Please try again later.',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export function successResponse<T>(data: T, meta?: ApiResponse['meta'], status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
      error: null,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
