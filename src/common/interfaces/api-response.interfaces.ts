export interface ApiResponseMeta {
  timestamp: string;
  correlationId: string;
  path: string;
  duration?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta: ApiResponseMeta;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export class ApiResponseBuilder {
  static success<T>(data: T, meta: Partial<ApiResponseMeta>): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: meta.correlationId || 'unknown',
        path: meta.path || 'unknown',
        duration: meta.duration,
      },
    };
  }

  static error(
    error: ApiError,
    meta: Partial<ApiResponseMeta>,
  ): ApiResponse<never> {
    return {
      success: false,
      error,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: meta.correlationId || 'unknown',
        path: meta.path || 'unknown',
        duration: meta.duration,
      },
    };
  }
}
