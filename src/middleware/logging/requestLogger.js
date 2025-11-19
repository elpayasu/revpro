module.exports = function requestLogger() {
  return (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const timestamp = new Date().toISOString();
      const status = res.statusCode;
      const method = req.method.padEnd(4, ' ');
      const url = req.url;

      console.log(`[${timestamp}] ${method} ${url} → ${status} (${duration}ms)`);
    });

    next();
  };
};
