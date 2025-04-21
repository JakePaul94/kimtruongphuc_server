import express from 'express';

import imgController from '../controllers/imgController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const imgRouter = express.Router();

imgRouter.post('/scan-qr', imgController.scanQR)

export default imgRouter;