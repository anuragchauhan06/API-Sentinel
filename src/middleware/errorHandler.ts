
import type { ErrorRequestHandler } from "express";
import { env } from "../config/env";

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  const statusCode =
    typeof err.status === "number" &&
    err.status >= 400 &&
    err.status < 600
      ? err.status
      : 500;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500 && env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Something went wrong",
  });
};
