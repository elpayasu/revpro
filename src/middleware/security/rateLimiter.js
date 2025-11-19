class RateLimiter {
  constructor(opts = {}) {
    this.max = opts.maxRequestsPerMinute || 1200;
    this.counters = new Map();
    this.interval = setInterval(() => this.counters.clear(), 60_000);
  }

  middleware(req, res, next) {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const cnt = this.counters.get(ip) || 0;
    if (cnt >= this.max) {
      res.statusCode = 429;
      res.setHeader('Retry-After', '60');
      res.end('Too Many Requests');
      return;
    }
    this.counters.set(ip, cnt + 1);
    next();
  }
}

module.exports = RateLimiter;
