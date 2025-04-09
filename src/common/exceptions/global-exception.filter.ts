import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import logger from '../logger/logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const SERVER_ERROR_START: number = HttpStatus.INTERNAL_SERVER_ERROR;

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Algo deu errado!';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        const msg = (res as { message: string | string[] }).message;
        message = Array.isArray(msg) ? msg.join(' | ') : msg;
      } else {
        message = exception.message;
      }
    }

    if (status >= SERVER_ERROR_START) {
      logger.error(`[${status}] ${message} - ${request.method} ${request.url}`);
    } else {
      logger.warn(`[${status}] ${message} - ${request.method} ${request.url}`);
    }

    response.status(status).send({
      status: `${status}`.startsWith('4') ? 'fail' : 'error',
      message,
    });
  }
}
