// src/routes/taskRouter.ts

import { Router } from "express";
import { taskController } from "../controllers/task/taskController";
import { requireRole } from "../middlewares/requireRoleMiddleware";
import { checkPermission } from "../middlewares/checkPermission"; // Giả sử đường dẫn đúng
import { isAuthenticated } from "../middlewares/authMiddleware"; // Middleware xác thực chung

const taskRouter = Router();

taskRouter.post(
  "/create",
  checkPermission("create:task"),
  taskController.createTask
);

taskRouter.get(
  "/:id",
  checkPermission("view:task_detail"),
  taskController.getTaskById
);

taskRouter.put(
  "/:id",
  checkPermission("update:task_details"),
  taskController.updateTask
);

taskRouter.put(
  "/:id/assign-user",
  checkPermission("assign:task"),
  taskController.assignTaskToUser
);

taskRouter.put(
  "/:id/status",
  checkPermission("update:task_status"),
  taskController.changeTaskStatus
);

taskRouter.put(
  "/:id/complete",
  checkPermission("complete:task"),
  taskController.completeTask
);

taskRouter.delete(
  "/:id/deltete",
  checkPermission("delete:task"),
  taskController.deleteTask
);

export default taskRouter;
