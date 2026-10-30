export function createRateLimiter(options) {
  const records = new Map();
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    const entry = records.get(ip);
    if (!entry || now > entry.resetTime) {
      records.set(ip, { count: 1, resetTime: now + options.windowMs });
      return next();
    }
    if (entry.count >= options.maxRequests) {
      return res.status(429).json({ error: "Too many requests, please try again later" });
    }
    entry.count++;
    next();
  };
}
