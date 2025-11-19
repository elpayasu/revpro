module.exports = {
  port: 8080,
  bind: '0.0.0.0',
  trustProxy: true,
  logFormat: 'combined',
  maxRequestsPerMinute: 1200,
  maxBodyBytes: 2 * 1024 * 1024,
  cors: { enabled: false, allowOrigins: ['*'] },
  basicAuth: null,
  ipWhitelist: [],
  ipBlacklist: [],
  upstreams: [{ url: 'http://127.0.0.1:3000', priority: 1 }],
  healthCheckInterval: 15000,
  healthCheckPath: '/healthz',
  https: null,
  plugins: []
};
