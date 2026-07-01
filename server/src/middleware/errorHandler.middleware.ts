import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.ts";
import logger from "../utils/logger.ts";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  logger.error(err, "Unhandled API error");
  res.status(500).json({ message: "Internal server error" });
};
