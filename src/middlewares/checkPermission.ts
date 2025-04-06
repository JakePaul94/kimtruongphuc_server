import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AuthRequest } from '../types/authType';
import { ApiError } from '../utils/ApiError'; // Import ApiError để sử dụng lỗi tùy chỉnh

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

export const checkCreateUserPermission = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!JWT_SECRET) {
    return next(new ApiError(500, 'Internal server error: JWT secret not configured.'));
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = decoded.user;


      if (user && (user.role === 'admin' || user.permissions?.includes('create:user'))) {
        req.user = user;
        return next();
      } else {
        return next(new ApiError(403, 'Forbidden: Insufficient permissions to create users.'));
      }
    } catch (error) {
      console.error('Error verifying JWT:', error);
      return next(new ApiError(401, 'Unauthorized: Invalid or expired token.'));
    }
  } else {
    return next(new ApiError(401, 'Unauthorized: Missing or invalid Authorization header.'));
  }
};
export const checkPermission = (requiredPermission: string) => {
  // Trả về middleware function thực tế
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!JWT_SECRET) {
      // Lỗi này nên được xử lý ở tầng cao hơn hoặc ghi log, nhưng vẫn trả về lỗi 500
      console.error('FATAL: JWT_SECRET is not configured.');
      return next(new ApiError(500, 'Internal server error'));
    }

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const user = decoded.user; // Lấy user object từ payload đã decode

        // Kiểm tra user tồn tại và có quyền yêu cầu hoặc là admin
        if (
          user &&
          (user.role === 'admin' || // Admin luôn có quyền
            (user.permissions && user.permissions.includes(requiredPermission))) // Hoặc có permission cụ thể
        ) {
          // Gắn thông tin user vào request để các handler sau có thể sử dụng nếu cần
          // Mặc dù middleware này chỉ kiểm tra quyền, việc gắn user vẫn hữu ích
          req.user = user;
          return next(); // Cho phép đi tiếp
        } else {
          // User không có quyền cần thiết
          return next(
            new ApiError(
              403,
              `Forbidden: Missing required permission '${requiredPermission}'.`
            )
          );
        }
      } catch (error: any) {
        console.error('Error verifying JWT:', error.message);
        // Phân biệt lỗi token hết hạn và token không hợp lệ nếu cần
        if (error.name === 'TokenExpiredError') {
           return next(new ApiError(401, 'Unauthorized: Token expired.'));
        }
        return next(new ApiError(401, 'Unauthorized: Invalid token.'));
      }
    } else {
      // Không có header Authorization hoặc không đúng định dạng Bearer
      return next(
        new ApiError(401, 'Unauthorized: Missing or invalid Authorization header.')
      );
    }
  };
};
