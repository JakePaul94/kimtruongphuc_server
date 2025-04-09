import express from "express";
import { cleaningController } from "../../controllers/tasks/cleaningController";

const cleaningRouter = express.Router();

// 📌 TEMPLATE routes
cleaningRouter.get("/templates", cleaningController.getAllTemplates);
cleaningRouter.get("/templates/:id", cleaningController.getTemplateById);
cleaningRouter.post("/templates", cleaningController.createTemplate);
cleaningRouter.put("/templates/:id", cleaningController.updateTemplate);
cleaningRouter.delete("/templates/:id", cleaningController.deleteTemplate);

// 📌 TASK routes
cleaningRouter.get("/tasks/:boilerId", cleaningController.getTasksByDate); // ?date=YYYY-MM-DD
cleaningRouter.post("/tasks", cleaningController.createTask);
cleaningRouter.put("/tasks/:id/status", cleaningController.updateTaskStatus);

export default cleaningRouter;
