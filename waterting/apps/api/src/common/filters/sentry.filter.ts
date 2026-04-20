import { ArgumentsHost, Catch, HttpException, HttpServer, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class SentryFilter extends BaseExceptionFilter {
  constructor(applicationAdapterHost: HttpAdapterHost) {
    super(applicationAdapterHost.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    if (process.env.SENTRY_DSN && this.shouldReport(exception)) {
      Sentry.captureException(exception);
    }
    super.catch(exception, host);
  }

  private shouldReport(exception: unknown): boolean {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return status >= 500; // Only report server errors
    }
    return true; // Report all non-HTTP exceptions (unexpected errors)
  }
}
