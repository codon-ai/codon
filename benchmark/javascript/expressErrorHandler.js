export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad request") {
    super(400, message);
  }
}

export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  } else {
    res.status(500).json({
      error: "Internal Server Error",
      statusCode: 500,
    });
  }
}
