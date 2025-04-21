export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const NotFound = (msg: string) => new AppError(msg, 404);
export const BadRequest = (msg: string) => new AppError(msg, 400);
