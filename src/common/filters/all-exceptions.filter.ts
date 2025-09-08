// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseResponse } from '../dto/base-response.dto';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request.headers['x-request-id'] || '';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan pada server';
    let data: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      // jika response sudah BaseResponse, return langsung
      if (res instanceof BaseResponse) {
        response.status(status).json(res);
        return;
      }

      // ambil message/data jika res object
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || message;
        data = (res as any).data ?? null;
      } else if (typeof res === 'string') {
        message = res;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Terjadi kesalahan saat mengakses basis data';
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `Exception | CorrelationId: ${correlationId} | Request: ${request.method} ${request.url} | Message: ${message}`,
      (exception as any)?.stack,
    );

    const baseResponse =
      status >= 500 ? BaseResponse.Error(message, data) : BaseResponse.Fail(message, data);

    response.status(status).json(baseResponse);
  }
}
