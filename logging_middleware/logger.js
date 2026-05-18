function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const remote = req.ip || req.connection?.remoteAddress || "-";
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms ${remote}`);
  });
  next();
}

module.exports = requestLogger;
