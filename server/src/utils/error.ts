import { Request, Response, NextFunction, RequestHandler } from "express";

export const AsyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export class ApiError extends Error {
  statusCode: number;
  data: null;
  success: boolean;
  errors: unknown[];

  constructor(
    statusCode: number,
    message: string = "something went wrong",
    errors: unknown[] = [],
    stack?: string
  ) {
    super(message);

    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
