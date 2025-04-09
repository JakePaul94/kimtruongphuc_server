import { Request, Response, NextFunction } from "express";
import userService from "../services/userService";
import { ApiError } from "../utils/ApiError"; // Import ApiError
import fs from "fs";
import path from "path";
const userController = {
  getAllUsers: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const users = await userService.getAllUsersWithManagers();
      res.json(users);
    } catch (error: any) {
      next(error);
    }
  },

  getUserById: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = parseInt(req.params.id, 10);
    try {
      const user = await userService.getUserByIdWithManager(userId);
      if (user) {
        res.json(user);
      } else {
        throw new ApiError(404, "User not found");
      }
    } catch (error: any) {
      next(error);
    }
  },

  createUser: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let filePath: string | undefined;
    try {
      const userData = req.body;

      if (
        !userData.password ||
        !userData.email ||
        !userData.fullName
      ) {
        throw new ApiError(400, "Missing required fields.");
      }

      if (req.file) {
        const fileName = req.file.filename;
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;
        userData.profilePicture = fileUrl;
      }

      const newUser = await userService.createUser(userData);

      res.status(201).json({
        message: "User created successfully",
        user: newUser,
      });
    } catch (error: any) {
      console.error("Error in createUser controller:", error);
      if (filePath) {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      if (error.message === "Username or email already exists.") {
        throw new ApiError(409, error.message);
      } else {
        next(error);
      }
    }
  },
};

export default userController;
