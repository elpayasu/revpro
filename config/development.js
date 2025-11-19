module.exports = {
  port: 8080,
  bind: '127.0.0.1',
  trustProxy: false,
  logFormat: 'dev',
  maxRequestsPerMinute: 1200,
  maxBodyBytes: 2 * 1024 * 1024,
  cors: { enabled: true, allowOrigins: ['http://localhost:3000'] },
  basicAuth: { username: 'admin', password: 'admin' },
  ipWhitelist: [],
  ipBlacklist: [],
  upstreams: [{ url: 'http://127.0.0.1:3000', priority: 1 }],
  healthCheckInterval: 5000,
  healthCheckPath: '/healthz',
  https: null,
  plugins: []
};
