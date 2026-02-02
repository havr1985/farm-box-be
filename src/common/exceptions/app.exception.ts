import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppExceptionOptions {
  type?: string;
  title?: string;
  detail?: string;
  errors?: Array<{ field: string; message: string; code?: string }>;
}

export class AppException extends HttpException {
  public readonly type: string;
  public readonly title: string;
  public readonly detail?: string;
  public readonly errors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;

  constructor(status: HttpStatus, options: AppExceptionOptions = {}) {
    const title = options.title || HttpStatus[status] || 'Error';

    super(
      {
        type: options.type || `https://groceryflow.dev/errors/${status}`,
        title,
        status,
        detail: options.detail,
        errors: options.errors,
      },
      status,
    );

    this.type = options.type || `https://groceryflow.dev/errors/${status}`;
    this.title = title;
    this.detail = options.detail;
    this.errors = options.errors;
  }
}

export class BadRequestException extends AppException {
  constructor(
    detail?: string,
    errors?: Array<{ field: string; message: string }>,
  ) {
    super(HttpStatus.BAD_REQUEST, {
      type: 'https://groceryflow.dev/errors/bad-request',
      title: 'Bad Request',
      detail: detail || 'The request was invalid or malformed',
      errors,
    });
  }
}

export class UnauthorizedException extends AppException {
  constructor(detail?: string) {
    super(HttpStatus.UNAUTHORIZED, {
      type: 'https://groceryflow.dev/errors/unauthorized',
      title: 'Unauthorized',
      detail: detail || 'Authentication is required to access this resource',
    });
  }
}

export class ForbiddenException extends AppException {
  constructor(detail?: string) {
    super(HttpStatus.FORBIDDEN, {
      type: 'https://groceryflow.dev/errors/forbidden',
      title: 'Forbidden',
      detail: detail || 'You do not have permission to access this resource',
    });
  }
}

export class NotFoundException extends AppException {
  constructor(resource: string, id?: string) {
    const detail = id
      ? `${resource} with ID '${id}' was not found`
      : `${resource} was not found`;

    super(HttpStatus.NOT_FOUND, {
      type: 'https://groceryflow.dev/errors/not-found',
      title: 'Resource Not Found',
      detail,
    });
  }
}

export class ConflictException extends AppException {
  constructor(detail: string) {
    super(HttpStatus.CONFLICT, {
      type: 'https://groceryflow.dev/errors/conflict',
      title: 'Conflict',
      detail,
    });
  }
}

export class InternalServerException extends AppException {
  constructor(detail?: string) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, {
      type: 'https://groceryflow.dev/errors/internal-error',
      title: 'Internal Server Error',
      detail: detail || 'An unexpected error occurred. Please try again later.',
    });
  }
}

export class InsufficientStockException extends AppException {
  constructor(productId: string, requested: number, available: number) {
    super(HttpStatus.CONFLICT, {
      type: 'https://groceryflow.dev/errors/insufficient-stock',
      title: 'Insufficient Stock',
      detail: `Product '${productId}' has only ${available} items available, but ${requested} were requested`,
    });
  }
}

export class DuplicateOrderException extends AppException {
  constructor(idempotencyKey: string) {
    super(HttpStatus.CONFLICT, {
      type: 'https://groceryflow.dev/errors/duplicate-order',
      title: 'Duplicate Order',
      detail: `Order with idempotency key '${idempotencyKey}' already exists`,
    });
  }
}
