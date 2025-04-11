import * as winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  printf(({ timestamp, level, message }) => {
    return `${timestamp as string} [${level}]: ${message as string}`;
  }),
);

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),

    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
