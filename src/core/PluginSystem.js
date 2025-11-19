class PluginSystem {
  constructor(plugins = []) {
    this.plugins = Array.isArray(plugins) ? plugins : [];
  }

  applyMiddlewares(app) {
    this.plugins.forEach(p => {
      try {
        if (typeof p === 'function') p(app);
        else if (p && typeof p.middleware === 'function') p.middleware(app);
      } catch (e) {
        // ignore plugin errors
      }
    });
  }
}

module.exports = PluginSystem;
