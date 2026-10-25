# Express Bearer Auth Middleware
Create a Bearer token authorization middleware for Express in a single file.

Requirements:
- Import `{ Request, Response, NextFunction }` from `"express"`.
- Export function `createAuthMiddleware(validToken: string)`.
- Returned middleware inspects `req.headers.authorization`.
- If authorization header is missing or does not start with `"Bearer "`, return `res.status(401).json({ error: "Unauthorized: Missing or malformed token" })`.
- Extract token. If token does not match `validToken`, return `res.status(403).json({ error: "Forbidden: Invalid token" })`.
- If token matches, attach `(req as any).user = { token, authenticated: true }` and invoke `next()`.
