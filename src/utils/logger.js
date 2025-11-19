const winston = require('winston');
require('winston-daily-rotate-file');

const { combine, timestamp, printf, colorize, errors, json, splat } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] ${level}: ${message}\nStack: ${stack}`
      : `[${timestamp}] ${level}: ${message}`;
  })
);

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  level: 'info',
  format: combine(timestamp(), errors({ stack: true }), json())
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    dailyRotateFileTransport
  ],
  exitOnError: false
});

logger.stream = {
  write: (msg) => logger.info(msg.trim())
};

module.exports = { logger };
