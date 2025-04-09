import express from "express";
import { inspectionController } from "../../controllers/tasks/inspectionController";

const inspectionRouter = express.Router();

// 📌 TEMPLATE routes
inspectionRouter.get("/templates", inspectionController.getAllTemplates);
inspectionRouter.get("/templates/:id", inspectionController.getTemplateById);
inspectionRouter.post("/templates", inspectionController.createTemplate);
inspectionRouter.put("/templates/:id", inspectionController.updateTemplate);
inspectionRouter.delete("/templates/:id", inspectionController.deleteTemplate);

// 📌 TASK routes
inspectionRouter.get("/tasks/:boilerId", inspectionController.getTasksByBoilerAndDate); // ?date=YYYY-MM-DD
inspectionRouter.post("/tasks", inspectionController.createTask);
inspectionRouter.put("/tasks/:id/status", inspectionController.updateTaskStatus);

export default inspectionRouter;
