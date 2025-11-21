module.exports = {
  name: 'Logger',

  middleware: (app, events) => {
	  
    // Hook when request comes in
    app.use((req, res, next) => {
      req.startTime = Date.now();
      events?.emit('plugin:request', { path: req.url, method: req.method });
      console.log(`[LOGGER] Request: ${req.method} ${req.url}`);
      next();
    });

    // Hook when the response is complete
    app.use((req, res, next) => {
      res.on('finish', () => {
        events?.emit('plugin:response', {
          path: req.url,
          method: req.method,
          statusCode: res.statusCode,
          duration: Date.now() - req.startTime
        });
        console.log(`[LOGGER] Response: ${req.method} ${req.url} -> ${res.statusCode}`);
      });
      next();
    });
  },

  // Hook when upstream is healthy
  onUpstreamHealthy: (url) => {
    console.log(`[LOGGER] Upstream became healthy: ${url}`);
  },

  // Hook when upstream is unhealthy
  onUpstreamUnhealthy: (url) => {
    console.log(`[LOGGER] Upstream became unhealthy: ${url}`);
  }
};
