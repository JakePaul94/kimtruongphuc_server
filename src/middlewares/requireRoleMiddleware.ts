import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AuthRequest } from '../types/authType'; // Đảm bảo đường dẫn đúng
import { ApiError } from '../utils/ApiError';    // Đảm bảo đường dẫn đúng

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;


export const requireRole = (requiredRoles: string | string[]) => {

  const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  if (rolesArray.length === 0) {
      console.warn('Warning: requireRole middleware called with empty roles array.');
  }

  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!JWT_SECRET) {
      console.error('FATAL: JWT_SECRET is not configured.');
      return next(new ApiError(500, 'Internal server error'));
    }

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const user = decoded.user;
        if (user && user.role && rolesArray.includes(user.role)) {
          req.user = user;
          return next(); 
        } else {
          let errorMessage = 'Forbidden: Insufficient role permissions.';
          if (user && user.role) {
               errorMessage = `Forbidden: Role '${user.role}' does not have permission. Required roles: ${rolesArray.join(' or ')}.`;
          } else if (user) {
               errorMessage = 'Forbidden: User role information is missing in token.';
          }
          return next(new ApiError(403, errorMessage));
        }
      } catch (error: any) {
        console.error('Error verifying JWT:', error.message);
         if (error.name === 'TokenExpiredError') {
           return next(new ApiError(401, 'Unauthorized: Token expired.'));
        }
        return next(new ApiError(401, 'Unauthorized: Invalid token.'));
      }
    } else {
      return next(
        new ApiError(401, 'Unauthorized: Missing or invalid Authorization header.')
      );
    }
  };
};