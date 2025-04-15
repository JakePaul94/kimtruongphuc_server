import { models } from "../config/database";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import dotenv from "dotenv";
import { ApiError } from "../utils/ApiError";
import { sanitizeUser } from "../utils/sanitizeUser";

dotenv.config();

const { User, RefreshToken, LoginHistory } = models;
const JWT_SECRET = process.env.JWT_SECRET_KEY!;
const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN) || 3600;
const REFRESH_TOKEN_EXPIRES_IN = Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 63072000;

const authService = {
  // Đăng nhập bằng email hoặc phoneNumber
  login: async (
    identifier: string,
    password: string,
    ipAddress: string,
    userAgent: string,
    loginTimestamp: Date
  ) => {
    try {
      const user = await User.findOne({
        where: {
          [Op.or]: [{ email: identifier }, { phoneNumber: identifier }],
        },
      });

      if (!user) {
        await LoginHistory.create({
          userId: null,
          ipAddress,
          userAgent,
          loginTimestamp,
          status: "failed",
          reason: "User not found",
        });
        throw new ApiError(404, "User not found");
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        await LoginHistory.create({
          userId: user.id,
          ipAddress,
          userAgent,
          loginTimestamp,
          status: "failed",
          reason: "Invalid password",
        });
        throw new ApiError(401, "Invalid password");
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN };
      const accessToken = jwt.sign(payload, JWT_SECRET, signOptions);
      const refreshToken = uuidv4();

      await LoginHistory.create({
        userId: user.id,
        ipAddress,
        userAgent,
        loginTimestamp,
        status: "success",
      });

      await RefreshToken.create({
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000),
      });
      const userWithoutPassword = sanitizeUser(user);
      return {
        accessToken,
        refreshToken,
        user: userWithoutPassword,
      };
    } catch (error) {
      throw error;
    }
  },
 // Tự động đăng nhập bằng refresh token (NEW FUNCTION)
 autoLogin: async (
  refreshToken: string,
  ipAddress: string,
  userAgent: string,
  loginTimestamp: Date
) => {
  try {
    // 1. Tìm và xác thực refresh token
    const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });

    if (!storedToken) {
      // Không tìm thấy token => không hợp lệ hoặc đã bị xoá/hết hạn
      // Ghi log thất bại nếu cần thiết (không có userId ở đây)
      await LoginHistory.create({
          userId: null, // Không xác định được user
          ipAddress,
          userAgent,
          loginTimestamp,
          status: "failed",
          reason: "Auto-login failed: Invalid or non-existent refresh token",
        });
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    // 2. Kiểm tra token hết hạn
    if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
      const userId = storedToken.userId; // Lấy userId trước khi xóa
      await storedToken.destroy(); // Xóa token hết hạn khỏi DB
       await LoginHistory.create({
          userId: userId, // Ghi log với userId nếu có thể
          ipAddress,
          userAgent,
          loginTimestamp,
          status: "failed",
          reason: "Auto-login failed: Refresh token expired",
        });
      throw new ApiError(401, "Refresh token expired");
    }

    // 3. Lấy thông tin user từ userId trong token
    const user = await User.findByPk(storedToken.userId);
    if (!user) {
      // User không tồn tại (có thể đã bị xóa) => token không còn hợp lệ
      const userId = storedToken.userId;
      await storedToken.destroy(); // Xóa token mồ côi
      await LoginHistory.create({
          userId: userId,
          ipAddress,
          userAgent,
          loginTimestamp,
          status: "failed",
          reason: "Auto-login failed: User not found",
        });
      throw new ApiError(404, "User associated with token not found");
    }

    // --- Nếu mọi thứ hợp lệ ---

    // 4. Tạo payload cho access token mới
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    // 5. Tạo access token mới
    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // 6. Tạo refresh token mới (Refresh Token Rotation)
    const newRefreshToken = uuidv4();

    // 7. Xóa refresh token cũ và lưu refresh token mới vào DB
    await storedToken.destroy(); // Quan trọng: Vô hiệu hóa token đã sử dụng
    await RefreshToken.create({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000),
    });

    // 8. Ghi log lịch sử đăng nhập thành công
    await LoginHistory.create({
      userId: user.id,
      ipAddress,
      userAgent,
      loginTimestamp,
      status: "success",
      reason: "Auto-login via refresh token" // Ghi rõ phương thức
    });

    // 9. Chuẩn bị dữ liệu trả về (loại bỏ password)
    const userWithoutPassword = sanitizeUser(user);

    // 10. Trả về cấu trúc tương tự hàm login
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // Trả về token mới
      user: userWithoutPassword,
    };

  } catch (error) {
    // Ghi log lỗi nếu cần thiết
    console.error("AutoLogin Error:", error);
     // Đảm bảo ném lỗi ApiError hoặc lỗi chuẩn
     if (error instanceof ApiError) {
         throw error;
     }
     // Ghi log thất bại tổng quát nếu chưa được xử lý ở trên
     try {
       await LoginHistory.create({
         userId: null, // Không chắc chắn có userId ở giai đoạn này
         ipAddress,
         userAgent,
         loginTimestamp,
         status: "failed",
         reason: `Auto-login failed: Internal error - ${error instanceof Error ? error.message : String(error)}`,
       });
     } catch (logError) {
       console.error("Failed to log autoLogin failure:", logError);
     }
     throw new ApiError(500, "Auto-login failed due to an internal error");
  }
},
  // Đăng xuất - Xoá refresh token khỏi DB
  logout: async (refreshToken: string) => {
    try {
      await RefreshToken.destroy({ where: { token: refreshToken } });
    } catch (error) {
      throw new ApiError(500, "Error logging out");
    }
  },

  // Làm mới token
  refreshToken: async (refreshToken: string) => {
    try {
      const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });
      if (!storedToken) throw new ApiError(404, "Refresh token not found");

      if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
        await storedToken.destroy();
        throw new ApiError(401, "Refresh token expired");
      }

      const user = await User.findByPk(storedToken.userId);
      if (!user) throw new ApiError(404, "User not found");

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      const newAccessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      const newRefreshToken = uuidv4();

      await storedToken.destroy();
      await RefreshToken.create({
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000),
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw error;
    }
  },

  // Đổi mật khẩu
  changePassword: async (
    userId: number,
    oldPassword: string,
    newPassword: string
  ) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new ApiError(404, "User not found");

      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) throw new ApiError(400, "Old password is incorrect");

      const newHashed = await bcrypt.hash(newPassword, 10);
      await user.update({ password: newHashed, firstLogin: false });

      return true;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
