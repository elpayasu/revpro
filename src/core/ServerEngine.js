const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const ProxyEngine = require('./ProxyEngine');
const SecurityManager = require('./SecurityManager');
const MiddlewareLoader = require('./MiddlewareLoader');
const ErrorHandler = require('./ErrorHandler');
const { logger } = require('../utils/logger');

class ServerEngine {
  constructor(options = {}) {
    this.options = options;
    this.port = options.port || 8080;
    this.proxy = ProxyEngine.createProxy(options);
    this.security = new SecurityManager(options);
    this.middlewareLoader = new MiddlewareLoader();
    this.errorHandler = new ErrorHandler();
    this.server = null;
  }

  _createServerInstance() {
    if (this.options.https && this.options.https.enabled && this.options.https.key && this.options.https.cert) {
      const key = fs.readFileSync(path.resolve(this.options.https.key));
      const cert = fs.readFileSync(path.resolve(this.options.https.cert));
      return https.createServer({ key, cert }, (req, res) => this._handle(req, res));
    }
    return http.createServer((req, res) => this._handle(req, res));
  }

  async _handle(req, res) {
    try {
      const blocked = await this.security.wafMiddleware(req, res, () => {});
      this.proxy._internal.app(req, res);
    } catch (err) {
      this.errorHandler.handle(err, req, res);
    }
  }

  start() {
    if (this.server) return this.server;
    this.server = this._createServerInstance();
    this.server.listen(this.port, () => logger.info(`ServerEngine running on ${this.port}`));
    return this.server;
  }

  stop() {
    if (!this.server) return;
    this.server.close();
    this.server = null;
  }
}

module.exports = ServerEngine;
