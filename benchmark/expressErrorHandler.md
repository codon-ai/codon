# Express Centralized Error Handler
Create a custom error class hierarchy and centralized Express error handling middleware in a single file.

Requirements:
- Export class `HttpError extends Error`: constructor takes `statusCode: number` and `message: string`. Assigns `this.statusCode = statusCode`.
- Export class `NotFoundError extends HttpError`: constructor takes `message = "Resource not found"`, calls `super(404, message)`.
- Export class `BadRequestError extends HttpError`: constructor takes `message = "Bad request"`, calls `super(400, message)`.
- Export 4-argument Express error handler `errorHandler(err: any, req: Request, res: Response, next: NextFunction): void`.
- If `err instanceof HttpError`, respond `res.status(err.statusCode).json({ error: err.message, statusCode: err.statusCode })`.
- Otherwise, respond `res.status(500).json({ error: "Internal Server Error", statusCode: 500 })`.
