class MiddlewareLoader {
  constructor() {}
  static load(list = []) {
    return list.map(fn => (typeof fn === 'function' ? fn : null)).filter(Boolean);
  }
}
module.exports = MiddlewareLoader;
