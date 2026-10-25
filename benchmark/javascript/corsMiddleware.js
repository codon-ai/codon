export function corsMiddleware(options = {}) {
  return function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", options.origin || "*");
    if (options.allowCredentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    if (options.methods) {
      res.setHeader("Access-Control-Allow-Methods", options.methods.join(", "));
    }
    if (options.allowedHeaders) {
      res.setHeader("Access-Control-Allow-Headers", options.allowedHeaders.join(", "));
    }
    if (options.maxAge) {
      res.setHeader("Access-Control-Max-Age", String(options.maxAge));
    }
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
    } else {
      next();
    }
  };
}
