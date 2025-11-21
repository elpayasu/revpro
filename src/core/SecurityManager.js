const RateLimiter = require('../middleware/security/rateLimiter');
const IPFilter = require('../middleware/security/ipFilter');
const corsMiddlewareFactory = require('../middleware/security/cors');
const bodyLimitFactory = require('../middleware/security/bodyLimit');
const basicAuthMiddlewareFactory = require('../middleware/security/basicAuth');
const WAF = require('../security/waf');
const HeaderSanitizer = require('../security/headerSanitizer');
const SignatureBlocker = require('../security/signatureBlocker');
const { logger } = require('../utils/logger');

class SecurityManager {
  constructor(opts = {}) {
    this.opts = opts || {};

    this.rateLimiter = new RateLimiter({ maxRequestsPerMinute: opts.maxRequestsPerMinute || 1200 });
    this.ipFilter = new IPFilter({ whitelist: opts.ipWhitelist || [], blacklist: opts.ipBlacklist || [] });
    this.corsMiddlewareInstance = corsMiddlewareFactory(opts);
    this.bodyLimitMiddlewareInstance = bodyLimitFactory(opts);
    this.basicAuthMiddleware = basicAuthMiddlewareFactory(opts);
  }

  sendJsonError(res, message, code = 400) {
    if (!res.headersSent) {
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message, code } }));
    }
  }

  rateLimiterMiddleware(req, res, next) {
    try {
      this.rateLimiter.middleware(req, res, next);
    } catch (err) {
      logger.error('RateLimiter error', { err: err.message, ip: req.ip || req.socket.remoteAddress, url: req.url });
      next();
    }
  }

  ipFilterMiddleware(req, res, next) {
    try {
      this.ipFilter.middleware(req, res, next);
    } catch (err) {
      logger.error('IPFilter error', { err: err.message, ip: req.ip || req.socket.remoteAddress, url: req.url });
      next();
    }
  }

  corsMiddleware(req, res, next) {
    try {
      this.corsMiddlewareInstance(req, res, next);
    } catch (err) {
      logger.error('CORS middleware error', { err: err.message, ip: req.ip || req.socket.remoteAddress, url: req.url });
      next();
    }
  }

  bodyLimitMiddleware(req, res, next) {
    const max = this.opts.maxBodyBytes || 2 * 1024 * 1024;
    const skipPaths = this.opts.bodyLimitSkipPaths || ['/healthz', '/__proxy__/status'];

    if (skipPaths.includes(req.path) || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    const contentLength = req.headers['content-length'] || 0;
    if (Number(contentLength) > max) {
      logger.warn('Payload Too Large', { ip: req.ip || req.socket.remoteAddress, url: req.url, contentLength });
      return this.sendJsonError(res, 'Payload Too Large', 413);
    }

    if (Number(contentLength) === 0) return next();

    try {
      const result = this.bodyLimitMiddlewareInstance(req, res, next);
      if (result && typeof result.then === 'function') {
        result.catch(err => {
          logger.warn('Invalid Body', { err: err.message, ip: req.ip || req.socket.remoteAddress, url: req.url });
          return this.sendJsonError(res, 'Invalid Body', 400);
        });
      }
    } catch (err) {
      logger.warn('Body limit middleware error', { err: err.message, ip: req.ip || req.socket.remoteAddress, url: req.url });
      return this.sendJsonError(res, 'Invalid Body', 400);
    }
  }

  wafMiddleware(req, res, next) {
    try {
      HeaderSanitizer.sanitize(req);

      if (SignatureBlocker.blocked(req)) {
        logger.warn('Blocked malicious signature', { ip: req.ip || req.socket.remoteAddress, url: req.url, headers: req.headers });
        return this.sendJsonError(res, 'Forbidden', 403);
      }

      if (WAF.inspect(req)) {
        logger.warn('Blocked request by WAF', { ip: req.ip || req.socket.remoteAddress, url: req.url });
        return this.sendJsonError(res, 'Forbidden', 403);
      }
    } catch (err) {
      logger.error('WAF inspection failed', { err: err.message, ip: req.ip || req.socket.remoteAddress, url: req.url });
    }

    next();
  }
}

module.exports = SecurityManager;
