// utils/loggerUtils.ts
import logger from './logger';  // Import logger đã cấu hình sẵn

export function logLoginSuccess(userId: string, username: string, ip: string, userAgent: string) {
  logger.info('Login successful', {
    userId,
    username,
    ip,
    userAgent,
    status: 'success',
  });
}

export function logLoginFailure(username: string, ip: string, userAgent: string, reason: string) {
  logger.warn('Login failed', {
    username,
    ip,
    userAgent,
    status: 'failure',
    reason,
  });
}

