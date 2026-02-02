import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';
import {
  ApiError,
  ApiResponseBuilder,
} from '@common/interfaces/api-response.interfaces';
import { AppException } from '@common/exceptions/app.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const correlationId = request.correlationId || 'unknown';
    const path = request.originalUrl ?? request.url;

    const { status, error } = this.buildError(exception, path);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { correlationId, ...error },
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn({ correlationId, ...error });
    }

    response
      .status(status)
      .json(ApiResponseBuilder.error(error, { correlationId, path }));
  }

  private buildError(
    exception: unknown,
    path: string,
  ): { status: HttpStatus; error: ApiError } {
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        error: {
          type: exception.type,
          title: exception.title,
          status: exception.getStatus(),
          detail: exception.detail,
          instance: path,
          errors: exception.errors,
        },
      };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse() as Record<string, unknown>;

      return {
        status,
        error: {
          type: `https://groceryflow.dev/errors/${status}`,
          title: (res.error as string) || HttpStatus[status],
          status,
          detail: Array.isArray(res.message)
            ? res.message.join(', ')
            : (res.message as string),
          instance: path,
          errors: Array.isArray(res.message)
            ? res.message.map((msg: string) => ({
                field: msg.split(' ')[0],
                message: msg,
              }))
            : undefined,
        },
      };
    }
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: {
        type: 'https://groceryflow.dev/errors/internal',
        title: 'Internal Server Error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        detail: 'An unexpected error occurred',
        instance: path,
      },
    };
  }
}
