import { models } from "../config/database";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { ApiError } from "../utils/ApiError"; // Import ApiError để xử lý lỗi tùy chỉnh

dotenv.config();

const { User, RefreshToken, LoginHistory } = models;
const JWT_SECRET = process.env.JWT_SECRET_KEY!;
const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN) || 3600;
const REFRESH_TOKEN_EXPIRES_IN =
  Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 63072000;

const authService = {
  login: async (
    username: string,
    password: string,
    ipaddress: string,
    userAgent: string,
    loginTimestamp: Date
  ) => {
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        await LoginHistory.create({
          userId: null,
          ipAddress: ipaddress,
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
          ipAddress: ipaddress,
          userAgent: userAgent,
          loginTimestamp: loginTimestamp,
          status: "failed",
          reason: "Invalid password",
        });
        throw new ApiError(401, "Invalid password");
      }

      const payload = {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };

      const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN };
      const accessToken = jwt.sign(payload, JWT_SECRET, signOptions);
      const refreshToken = uuidv4();

      await LoginHistory.create({
        userId: user.id,
        ipAddress: ipaddress,
        userAgent: userAgent,
        loginTimestamp: loginTimestamp,
        status: "success"
      });
      await RefreshToken.create({
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000),
      });

      return {
        accessToken,
        refreshToken,
        firstLogin: user.firstLogin,
      };
    } catch (error) {
      throw error;
    }
  },

  logout: async (refreshToken: string) => {
    try {
      await RefreshToken.destroy({ where: { token: refreshToken } });
    } catch (error) {
      throw new ApiError(500, "Error logging out");
    }
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const storedToken = await RefreshToken.findOne({
        where: { token: refreshToken },
      });

      if (!storedToken) {
        throw new ApiError(404, "Refresh token not found");
      }

      if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
        await storedToken.destroy();
        throw new ApiError(401, "Refresh token expired");
      }

      const user = await User.findByPk(storedToken.userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const payload = {
        user: {
          id: user.id,
          username: user.username,
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
        id: 0,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw error; // Ném lỗi đi lên để middleware xử lý
    }
  },

  changePassword: async (
    userId: number,
    oldPassword: string,
    newPassword: string
  ) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) {
        throw new ApiError(400, "Old password is incorrect");
      }

      const newHashed = await bcrypt.hash(newPassword, 10);
      await user.update({ password: newHashed, firstLogin: false });
      return true;
    } catch (error) {
      throw error; // Ném lỗi đi lên để middleware xử lý
    }
  },
};

export default authService;
