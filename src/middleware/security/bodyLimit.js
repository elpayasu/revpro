const getRawBody = require('raw-body');

module.exports = function bodyLimit(opts = {}) {
  const max = opts.maxBodyBytes || 2 * 1024 * 1024;
  return function (req, res, next) {
    const len = req.headers['content-length'];
    if (len && Number(len) > max) { res.statusCode = 413; res.end('Payload Too Large'); return; }
    getRawBody(req, { length: max, limit: max }).then(buf => { req.rawBody = buf; next(); }).catch(() => { next(); });
  };
};
