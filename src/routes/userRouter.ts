import express from "express";
import userController from "../controllers/userController";
import { checkCreateUserPermission, checkPermission } from "../middlewares/checkPermission";
import { getMulterUploader } from '../middlewares/multerConfig';
import { isAuthenticated } from "../middlewares/authMiddleware";
const userRouter = express.Router();
const upload = getMulterUploader('avatars');
userRouter.get("/",isAuthenticated, userController.getAllUsers);
userRouter.get("/:id", userController.getUserById);
userRouter.post("/create",checkPermission('create:user'),upload.single('avatar'), userController.createUser);

export default userRouter;
