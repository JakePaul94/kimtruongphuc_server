import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthRequest } from "../types/authType";
import { ApiError } from "../utils/ApiError";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

export const isAuthenticated = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!JWT_SECRET) {
    throw new ApiError(500, "Internal server error: JWT secret not configured.");
  }
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.user = decoded.user; 
      next();
    } catch (error) {
      return next(new ApiError(401, "Unauthorized: Invalid token."));
    }
  } else {
    return next(new ApiError(401, "Unauthorized: Missing token."));
  }
};
