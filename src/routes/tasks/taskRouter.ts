import taskController from "../../controllers/tasks/taskController";

const express = require('express');
const taskRouter = express.Router();
import { isAuthenticated } from "../../middlewares/authMiddleware";

taskRouter.get('/today',isAuthenticated, taskController.getAllTaskToday);

export default taskRouter;