import express from 'express';
import authController from '../controllers/authController';
import { isAuthenticated } from '../middlewares/authMiddleware'

const authRouter = express.Router();

authRouter.post('/login', authController.login);authRouter.post('/autologin', authController.autoLogin);
authRouter.post('/logout', authController.logout);
authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/change-password', isAuthenticated, authController.changePassword); 

export default authRouter;