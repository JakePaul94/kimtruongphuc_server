import { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";

export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  // Log chi tiết lỗi
  logger.error(`[Error Middleware] ${err.message}`, {
    statusCode: err.statusCode || 500,
    isOperational: err.isOperational,
    stack: err.stack,
    errorDetails: err.errorDetails,
  });

  // Xử lý lỗi kiểu ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      errorDetails: err.errorDetails,
    });
  } else {
    // Xử lý lỗi tổng quát
    res.status(500).json({
      message: "Something went wrong!",
      errorDetails: err.message,
    });
  }
};
