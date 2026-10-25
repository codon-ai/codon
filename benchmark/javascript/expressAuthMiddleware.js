export function createAuthMiddleware(validToken) {
  return function (req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized: Missing or malformed token",
      });
    }
    const token = auth.slice(7);
    if (token !== validToken) {
      return res.status(403).json({
        error: "Forbidden: Invalid token",
      });
    }
    req.user = { token, authenticated: true };
    next();
  };
}
