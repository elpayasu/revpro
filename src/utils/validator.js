module.exports = {
  isString(s) { return typeof s === 'string' && s.length > 0; },
  isArray(a) { return Array.isArray(a); }
};
