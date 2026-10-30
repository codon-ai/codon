# Express Counter
Create a counter website using the "express" library. The server should listen on port 8080 and have 4 GET routes:
1. "/" returns a JSON of the current value of the counter
2. "/increment" increments the counter and returns a JSON of the new value of the counter
3. "/decrement" decrements the counter and returns a JSON of the new value of the counter
4. "/reset" resets the counter to 0 and returns a JSON of the new value of the counter*** Add File: codon/benchmark/expressErrorHandler.md
# Express Centralized Error Handler
Create a custom error class hierarchy and centralized Express error handling middleware in a single file.

Requirements:
- Export class `HttpError extends Error`: constructor takes `statusCode: number` and `message: string`. Assigns `this.statusCode = statusCode`.
- Export class `NotFoundError extends HttpError`: constructor takes `message = "Resource not found"`, calls `super(404, message)`.
- Export class `BadRequestError extends HttpError`: constructor takes `message = "Bad request"`, calls `super(400, message)`.
- Export 4-argument Express error handler `errorHandler(err: any, req: Request, res: Response, next: NextFunction): void`.
- If `err instanceof HttpError`, respond `res.status(err.statusCode).json({ error: err.message, statusCode: err.statusCode })`.
- Otherwise, respond `res.status(500).json({ error: "Internal Server Error", statusCode: 500 })`.
