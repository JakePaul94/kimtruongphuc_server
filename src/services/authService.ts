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
