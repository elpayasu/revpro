const basicAuth = require('basic-auth');
const { logger } = require('../../utils/logger');

module.exports = function basicAuthMiddleware(opts = {}) {
  const realm = (opts.auth && opts.auth.realm) || 'Restricted';

  function sendJsonError(res, message, code = 401) {
    if (!res.headersSent) {
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message, code } }));
    }
  }

  return function (req, res, next) {
    try {
      if (!opts.auth) return next();

      const user = basicAuth(req) || {};
      const ip = req.ip || req.socket.remoteAddress;

      if (user.name === opts.auth.username && user.pass === opts.auth.password) {
        return next();
      }

      logger.warn('Unauthorized access attempt', {
        ip,
        url: req.url,
        username: user.name || null,
      });

      res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
      return sendJsonError(res, 'Unauthorized', 401);
    } catch (err) {
      logger.error('BasicAuth middleware error', {
        err: err.message,
        ip: req.ip || req.socket.remoteAddress,
        url: req.url,
      });
      next(err);
    }
  };
};
