module.exports = {
  port: 443,
  bind: '0.0.0.0',
  trustProxy: true,
  logFormat: 'combined',
  maxRequestsPerMinute: 6000,
  maxBodyBytes: 5 * 1024 * 1024,
  cors: { enabled: false, allowOrigins: ['https://yourdomain.com'] },
  basicAuth: null,
  ipWhitelist: [],
  ipBlacklist: [],
  upstreams: [
    { url: 'http://127.0.0.1:3000', priority: 1 },
    { url: 'http://127.0.0.1:3001', priority: 2 }
  ],
  healthCheckInterval: 10000,
  healthCheckPath: '/healthz',
  https: { enabled: true, key: '/etc/ssl/private/proxy.key', cert: '/etc/ssl/certs/proxy.crt' },
  plugins: []
};
