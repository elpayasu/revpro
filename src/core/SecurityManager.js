const basicAuth = require('basic-auth');
const getRawBody = require('raw-body');
const RateLimiter = require('../middleware/security/rateLimiter');
const IPFilter = require('../middleware/security/ipFilter');
const WAF = require('../security/waf');
const HeaderSanitizer = require('../security/headerSanitizer');
const { logger } = require('../utils/logger');

class SecurityManager {
  constructor(opts = {}) {
    this.opts = opts || {};
    this.rateLimiter = new RateLimiter({ maxRequestsPerMinute: opts.maxRequestsPerMinute || 1200 });
    this.ipFilter = new IPFilter({ whitelist: opts.ipWhitelist || [], blacklist: opts.ipBlacklist || [] });
  }

  rateLimiterMiddleware(req, res, next) {
    return this.rateLimiter.middleware(req, res, next);
  }

  ipFilterMiddleware(req, res, next) {
    return this.ipFilter.middleware(req, res, next);
  }

  basicAuthMiddleware(req, res, next) {
    if (!this.opts.basicAuth) return next();
    const user = basicAuth(req) || {};
    if (user.name === this.opts.basicAuth.username && user.pass === this.opts.basicAuth.password) return next();
    res.setHeader('WWW-Authenticate', 'Basic realm="Protected"');
    res.statusCode = 401; res.end('Unauthorized');
  }

  corsMiddleware(req, res, next) {
    const cors = this.opts.cors || { enabled: false };
    if (!cors.enabled) return next();
    const origin = req.headers.origin;
    if (cors.allowOrigins.includes('*') || (origin && cors.allowOrigins.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
    }
    next();
  }

  bodyLimitMiddleware(req, res, next) {
    const max = this.opts.maxBodyBytes || 2 * 1024 * 1024;
    const len = req.headers['content-length'];
    if (len && Number(len) > max) { res.statusCode = 413; res.end('Payload Too Large'); return; }
    getRawBody(req, { length: max, limit: max }).then(buf => { req.rawBody = buf; next(); }).catch(err => { next(); });
  }

  wafMiddleware(req, res, next) {
    try {
      if (WAF.inspect(req)) { res.statusCode = 403; res.end('Forbidden'); return; }
    } catch (e) {
      logger.error('WAF inspection failed', { err: e && e.message });
    }
    HeaderSanitizer.sanitize(req);
    next();
  }
}

module.exports = SecurityManager;
