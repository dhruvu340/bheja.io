import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/error.js";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      data: err.data
    });
    return;
  }

  
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err instanceof Error ? err.message : err
  });
};
