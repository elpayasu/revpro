const { logger } = require('../utils/logger');

class PluginSystem {
  constructor(plugins = []) {
    this.plugins = [];
    if (Array.isArray(plugins)) {
      plugins.forEach(p => this.register(p));
    }
  }

  register(plugin) {
    if (!plugin) return;
    if (typeof plugin === 'function' || (plugin && typeof plugin.middleware === 'function')) {
      this.plugins.push(plugin);
    } else {
      logger.warn('Invalid plugin ignored', { plugin });
    }
  }

  async applyMiddlewares(app) {
    for (const p of this.plugins) {
      try {
        if (typeof p === 'function') {
          const maybePromise = p(app);
          if (maybePromise instanceof Promise) await maybePromise;
        } else if (p && typeof p.middleware === 'function') {
          const maybePromise = p.middleware(app);
          if (maybePromise instanceof Promise) await maybePromise;
        }
      } catch (e) {
        logger.error('Plugin middleware error', {
          message: e.message,
          stack: e.stack,
          plugin: p.name || p.constructor?.name || 'anonymous'
        });
      }
    }
  }

  async trigger(eventName, ...args) {
    for (const p of this.plugins) {
      if (p && typeof p[eventName] === 'function') {
        try {
          const maybePromise = p[eventName](...args);
          if (maybePromise instanceof Promise) await maybePromise;
        } catch (e) {
          logger.error(`Plugin event hook error: ${eventName}`, {
            message: e.message,
            stack: e.stack,
            plugin: p.name || p.constructor?.name || 'anonymous'
          });
        }
      }
    }
  }
}

module.exports = PluginSystem;
