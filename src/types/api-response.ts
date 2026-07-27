export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      meta?: {
        page?: number;
        limit?: number;
        totalRecords?: number;
        totalPages?: number;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
      };
    };
