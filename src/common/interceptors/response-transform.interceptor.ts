import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { map, Observable } from 'rxjs';
import {
  ApiResponse,
  ApiResponseBuilder,
} from '@common/interfaces/api-response.interfaces';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T> | undefined
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | undefined> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        if (this.isApiResponse(data)) {
          return data as ApiResponse<T>;
        }

        if (response.statusCode === 204) return undefined;

        const duration = Date.now() - startTime;

        return ApiResponseBuilder.success(data, {
          correlationId: request.correlationId,
          path: request.originalUrl ?? request.url,
          duration,
        });
      }),
    );
  }

  private isApiResponse(data: unknown): data is ApiResponse<unknown> {
    return (
      typeof data === 'object' &&
      data !== null &&
      'success' in data &&
      'meta' in data
    );
  }
}
