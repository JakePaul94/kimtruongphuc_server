import logger from "./logger";

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorDetails?: any;

  constructor(statusCode: number, message: string, errorDetails?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errorDetails = errorDetails;
    
    logger.error(`[ApiError] ${message}`, {
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      errorDetails: this.errorDetails,
      stack: this.stack,
    });

    Error.captureStackTrace(this, this.constructor);
  }
}
