const { logger } = require('../utils/logger');

class ErrorHandler {
  static handle(err, req, res, next) {
    logger.error('Unhandled error', { err: err && (err.stack || err.message) });
    try {
      if (!res.headersSent) {
        res.statusCode = err && err.statusCode ? err.statusCode : 500;
        res.end(err && err.message ? err.message : 'Internal Server Error');
      }
    } catch (e) {}
  }
}

module.exports = ErrorHandler;
