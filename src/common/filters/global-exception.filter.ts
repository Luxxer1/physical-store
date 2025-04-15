import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../errors/app.error';
import logger from '../logger/logger';

@Catch(HttpException, AppError, Error)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<FastifyRequest>();
    const res = ctx.getResponse<FastifyReply>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const resBody = exception.getResponse();
      if (typeof resBody === 'string') {
        message = resBody;
      } else if (
        typeof resBody === 'object' &&
        resBody !== null &&
        'message' in resBody
      ) {
        const msg = (resBody as Record<string, unknown>).message;
        if (typeof msg === 'string') {
          message = msg;
        }
      }
    } else if (exception instanceof AppError) {
      statusCode = exception.statusCode;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const logMethod = Number(statusCode) >= 500 ? logger.error : logger.warn;
    logMethod(`[${statusCode}] ${message} - ${req.method} ${req.url}`);

    res.status(statusCode).send({
      status: Number(statusCode) >= 500 ? 'error' : 'fail',
      message,
    });
  }
}
