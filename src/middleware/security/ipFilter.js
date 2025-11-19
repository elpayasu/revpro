const ipaddr = require('ipaddr.js');

class IPFilter {
  constructor(opts = {}) {
    this.whitelist = Array.isArray(opts.whitelist) ? opts.whitelist : [];
    this.blacklist = Array.isArray(opts.blacklist) ? opts.blacklist : [];
  }

  _inList(ip, list) {
    try {
      if (!ip) return false;
      if (list.includes('*')) return true;
      for (const item of list) {
        if (item === ip) return true;
        if (item.includes('/')) {
          const range = ipaddr.parseCIDR(item);
          const addr = ipaddr.parse(ip);
          if (addr.match(range)) return true;
        }
      }
    } catch (e) {}
    return false;
  }

  middleware(req, res, next) {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    if (this._inList(ip, this.blacklist)) { res.statusCode = 403; res.end('Forbidden'); return; }
    if (this.whitelist.length && !this._inList(ip, this.whitelist)) { res.statusCode = 403; res.end('Forbidden'); return; }
    next();
  }
}

module.exports = IPFilter;
