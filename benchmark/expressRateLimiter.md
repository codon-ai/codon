# Express IP Rate Limiter Middleware
Create an in-memory sliding-window IP rate limiter middleware for Express in a single file without external libraries.

Requirements:
- Import `{ Request, Response, NextFunction }` from `"express"`.
- Export interface `RateLimiterOptions { windowMs: number; maxRequests: number; }`.
- Export function `createRateLimiter(options: RateLimiterOptions)`.
- Track requests using `Map<string, { count: number; resetTime: number }>()`.
- For each request, identify client IP via `req.ip || req.socket.remoteAddress || "unknown"`.
- If entry does not exist or `Date.now() > resetTime`, initialize `{ count: 1, resetTime: Date.now() + options.windowMs }` and call `next()`.
- If `count >= options.maxRequests`, return `res.status(429).json({ error: "Too many requests, please try again later" })`.
- Otherwise increment `count` and call `next()`.
