const basicAuth = require('basic-auth');

module.exports = function basicAuthMiddleware(opts = {}) {
  return function (req, res, next) {
    if (!opts || !opts.basicAuth) return next();
    const user = basicAuth(req) || {};
    if (user.name === opts.basicAuth.username && user.pass === opts.basicAuth.password) return next();
    res.setHeader('WWW-Authenticate', 'Basic realm="Restricted"');
    res.statusCode = 401; res.end('Unauthorized');
  };
};
