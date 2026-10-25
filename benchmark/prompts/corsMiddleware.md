# CORS Header Middleware
Create an Express/Connect compatible Cross-Origin Resource Sharing (CORS) middleware in a single file.

Requirements:
- Export interface `CorsOptions { origin?: string; methods?: string[]; allowedHeaders?: string[]; allowCredentials?: boolean; maxAge?: number; }`.
- Export function `corsMiddleware(options: CorsOptions = {})`.
- Returns middleware `(req: any, res: any, next: () => void) => void`.
- Sets `Access-Control-Allow-Origin: options.origin || "*"`.
- If `options.allowCredentials`, set `Access-Control-Allow-Credentials: "true"`.
- If `options.methods`, set `Access-Control-Allow-Methods: options.methods.join(", ")`.
- If `options.allowedHeaders`, set `Access-Control-Allow-Headers: options.allowedHeaders.join(", ")`.
- If `options.maxAge`, set `Access-Control-Max-Age: String(options.maxAge)`.
- If `req.method === "OPTIONS"`, respond with `res.statusCode = 204` and `res.end()`; otherwise call `next()`.
