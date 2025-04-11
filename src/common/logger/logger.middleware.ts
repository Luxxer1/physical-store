import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import logger from 'src/common/logger/logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });

    next();
  }
}
