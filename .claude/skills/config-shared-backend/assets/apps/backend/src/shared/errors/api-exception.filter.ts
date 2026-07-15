import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from '{{SHARED_PACKAGE}}';
import { ApiErrorResponse } from './api-error-response.type';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body = this._buildBody(exception, request.url);
    response.status(body.statusCode).json(body);
  }

  private _buildBody(exception: unknown, path: string): ApiErrorResponse {
    const timestamp = new Date().toISOString();

    if (exception instanceof ValidationError) {
      return {
        statusCode: exception.status ?? HttpStatus.BAD_REQUEST,
        error: 'Validation Error',
        message: [exception.codes],
        details: exception.messages,
        path,
        timestamp,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const raw = typeof payload === 'string' ? payload : ((payload as any).message ?? exception.message);
      const message: string[] = Array.isArray(raw) ? raw : [raw];

      return {
        statusCode: status,
        error: exception.name,
        message,
        path,
        timestamp,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Error',
      message: ['An unexpected error occurred. Please try again later.'],
      path,
      timestamp,
    };
  }
}
