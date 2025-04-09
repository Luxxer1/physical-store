import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  public readonly isOperational: boolean;
  public readonly errorType: 'fail' | 'error';

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(message, statusCode);

    this.errorType = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
  }
}
