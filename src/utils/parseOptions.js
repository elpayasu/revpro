const path = require('path');
module.exports = function parseOptions(opts) {
  if (!opts) return require('../../config/default');
  if (typeof opts === 'string') return require(path.resolve(process.cwd(), opts));
  return opts;
};
