import express from "express";
import userController from "../controllers/userController";
import {
  checkCreateUserPermission,
  checkPermission,
} from "../middlewares/checkPermission";
import { getMulterUploader } from "../middlewares/multerConfig";
import { isAuthenticated } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRoleMiddleware";
const userRouter = express.Router();
const upload = getMulterUploader("avatars");
userRouter.get("/", requireRole("admin"), userController.getAllUsers);
userRouter.get("/:id",requireRole('admin'), userController.getUserById);
userRouter.post(
  "/create",
  requireRole("admin"),
  userController.createUser
);

export default userRouter;
