import { Request, Response, NextFunction } from "express";
import authService from "../services/authService";
import { AuthRequest } from '../types/authType';
import { ApiError } from "../utils/ApiError";  // Import ApiError

const authController = {
  login: async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { identifier, password ,ipAddress,userAgent ,loginTimestamp} = req.body;
    console.log('Login request:', req.body);
    if (!identifier || !password ) {
      console.log('Lỗi:', req.body);
      throw new ApiError(400, "Identifier and password are required.");
    }

    console.log('Login body:', req.body);
    const result = await authService.login(identifier, password ,ipAddress,userAgent,loginTimestamp);

    if (!result) {
      throw new ApiError(401, "Invalid credentials.");
    }

    res.json(result);
  },
  autoLogin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ipAddress,userAgent,refreshToken,loginTimestamp } = req.body;

      // 1. Validate input
      if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required.");
      }

      const result = await authService.autoLogin(
        refreshToken,
        ipAddress,
        userAgent,
        loginTimestamp
      );

      // 4. Send successful response (service handles errors by throwing)
      // Kết quả trả về có cấu trúc giống như login
      res.json(result);

    } catch (error) {
      // 5. Pass errors to the global error handler middleware
      next(error);
    }
  },
  logout: async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, "Refresh token is required.");
    }

    await authService.logout(refreshToken);
    res.status(204).send(); // No content
  },

  refreshToken: async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, "Refresh token is required.");
    }

    const result = await authService.refreshToken(refreshToken);

    if (!result) {
      throw new ApiError(401, "Invalid or expired refresh token.");
    }

    res.json(result);
  },

  changePassword: async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id; // Lấy ID người dùng từ token (bạn cần middleware xác thực trước)
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      throw new ApiError(401, "Unauthorized.");
    }

    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Old and new passwords are required.");
    }

    const success = await authService.changePassword(userId, oldPassword, newPassword);

    if (!success) {
      throw new ApiError(400, "Invalid old password.");
    }

    res.status(204).send(); // No content
  },
};

export default authController;
