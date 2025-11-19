const { logger } = require('../utils/logger');

class ErrorHandler {
  static handle(err, req, res, next) {
    try {
      const error = err instanceof Error ? err : new Error(String(err));

      logger.error('Unhandled error', {
        message: error.message,
        stack: error.stack,
        path: req.url,
        method: req.method,
        headers: req.headers
      });

      if (!res.headersSent) {
        const statusCode = error.statusCode && Number.isInteger(error.statusCode) ? error.statusCode : 500;
        const responseBody = {
          success: false,
          error: {
            message: statusCode === 500 ? 'Internal Server Error' : error.message,
            code: statusCode
          }
        };

        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responseBody));
      }
    } catch (handlerError) {
      logger.error('Error in ErrorHandler', {
        message: handlerError.message,
        stack: handlerError.stack
      });

      try {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: { message: 'Internal Server Error', code: 500 } }));
        }
      } catch (_) {}
    }
  }
}

module.exports = ErrorHandler;
