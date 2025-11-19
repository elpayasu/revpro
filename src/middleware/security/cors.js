module.exports = function corsMiddleware(opts = {}) {
  return function (req, res, next) {
    const cors = opts.cors || { enabled: false, allowOrigins: [] };
    if (!cors.enabled) return next();
    const origin = req.headers.origin;
    if (cors.allowOrigins.includes('*') || (origin && cors.allowOrigins.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
    }
    next();
  };
};
