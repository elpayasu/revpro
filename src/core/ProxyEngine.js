const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const httpProxy = require('http-proxy');
const helmet = require('helmet');
const morgan = require('morgan');
const UpstreamManager = require('./UpstreamManager');
const SecurityManager = require('./SecurityManager');
const ErrorHandler = require('./ErrorHandler');
const PluginSystem = require('./PluginSystem');
const { logger } = require('../utils/logger');
const trustProxy = require('../middleware/system/trustProxy');
const disablePoweredBy = require('../middleware/system/disablePoweredBy');
const { probe } = require('../network/upstreamProbe');
const { resolve: dnsResolve } = require('../network/dnsResolver');
const DashboardPages = require('../../resource/dashboard/Pages');

function createProxy(userOptions = {}) {
  const opts = Object.assign({}, userOptions);
  const app = express();
  let server = null;
  const proxyServer = httpProxy.createProxyServer({});

  const upstreamManager = new UpstreamManager(opts.upstreams || [], opts);
  const securityManager = new SecurityManager(opts);
  const pluginSystem = new PluginSystem(opts.plugins || []);

  disablePoweredBy(app);
  if (opts.trustProxy) trustProxy(app);
  app.use(helmet());
  app.use((req, res, next) => res.setHeader('X-Content-Type-Options', 'nosniff') && next());
  app.use(morgan(opts.logFormat || 'combined', { stream: logger.stream }));

  app.use((req, res, next) => securityManager.rateLimiterMiddleware(req, res, next));
  app.use((req, res, next) => securityManager.ipFilterMiddleware(req, res, next));
  app.use((req, res, next) => securityManager.basicAuthMiddleware(req, res, next));
  app.use((req, res, next) => securityManager.corsMiddleware(req, res, next));
  app.use((req, res, next) => securityManager.bodyLimitMiddleware(req, res, next));
  app.use((req, res, next) => securityManager.wafMiddleware(req, res, next));

  try {
    pluginSystem.applyMiddlewares(app);
  } catch (err) {
    logger.error('PluginSystem applyMiddlewares error', { message: err.message, stack: err.stack });
  }

  const healthPath = opts.healthCheckPath || '/healthz';
  app.get('/__proxy__/status', (req, res) => {
   res.json({
      ok: true,
      upstreams: upstreamManager.list().map(u => ({
        url: u.url,
        priority: u.priority,
        weight: u.weight,
        healthy: u.healthy
      }))
    });
  });

  app.get(healthPath, async (req, res) => {
    const upstreams = upstreamManager.list();
    const allHealthy = upstreams.every(u => u.healthy);

    res.status(allHealthy ? 200 : 503).json({
      ok: allHealthy,
      upstreams: upstreams.map(u => ({
        url: u.url,
        priority: u.priority,
        weight: u.weight,
        healthy: u.healthy
      }))
    });
  });

  if (opts.dashboard) {
    app.get("/__proxy__/dashboard", async (req, res) => {
      try {
        await DashboardPages.dashboardPage(req, res, upstreamManager, opts);
      } catch (err) {
        logger.error("Dashboard error", err);
          res.status(500).send("Dashboard failed to load");
      }
    });
  }

  function sendJsonError(res, message, code = 502) {
    if (!res.headersSent) {
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: { message, code } }));
    }
  }

  app.use((req, res) => {
    let upstream = upstreamManager.pick();

    if (!upstream?.url) {
      logger.warn('No upstream available', { url: req.url });
      return sendJsonError(res, 'No upstream available', 502);
    }

    let target = upstream.url;

    proxyServer.web(req, res, { target, changeOrigin: true, preserveHeaderKeyCase: true }, (err) => {
      logger.error('Proxy error', { message: err?.message, stack: err?.stack, request: { method: req.method, url: req.url }, target });
      upstreamManager.markUnhealthy(upstream.url);

      const fallback = upstreamManager.list().find(u => u.healthy && u.url !== upstream.url);
      if (!fallback) {
        return sendJsonError(res, 'No healthy upstream available', 502);
      }

      target = fallback.url;

      proxyServer.web(req, res, { target, changeOrigin: true }, (err2) => {
        logger.error('Fallback proxy error', {
          message: err2?.message,
          stack: err2?.stack,
          request: { method: req.method, url: req.url },
          target
        });

        return sendJsonError(res, 'Fallback failed', 502);
      });
    });
  });

  app.use((err, req, res, next) => ErrorHandler.handle(err, req, res, next));

  function start() {
    if (server) return server;
    if (opts.https?.enabled && opts.https.key && opts.https.cert) {
      const key = fs.readFileSync(path.resolve(opts.https.key));
      const cert = fs.readFileSync(path.resolve(opts.https.cert));
      server = https.createServer({ key, cert }, app).listen(opts.port, opts.bind, () => {
        logger.info(`Proxy listening HTTPS on ${opts.bind}:${opts.port}`);
      });
    } else {
      server = http.createServer(app).listen(opts.port, opts.bind, () => {
        logger.info(`Proxy listening HTTP on ${opts.bind}:${opts.port}`);
      });
    }
    upstreamManager.start();
    return server;
  }

  function stop() {
    if (!server) return;
    server.close();
    upstreamManager.stop();
    server = null;
  }

  return { start, stop, _internal: { app, upstreamManager, securityManager, pluginSystem } };
}

module.exports = { createProxy };
