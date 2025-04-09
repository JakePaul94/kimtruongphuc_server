import express from "express";
import { maintenanceController } from "../../controllers/tasks/maintenanceController";

const maintenanceRouter = express.Router();

// 📌 TEMPLATE routes
maintenanceRouter.get("/templates", maintenanceController.getAllTemplates);
maintenanceRouter.get("/templates/:id", maintenanceController.getTemplateById);
maintenanceRouter.post("/templates", maintenanceController.createTemplate);
maintenanceRouter.put("/templates/:id", maintenanceController.updateTemplate);
maintenanceRouter.delete("/templates/:id", maintenanceController.deleteTemplate);

// 📌 TASK routes
maintenanceRouter.get("/tasks/:boilerId", maintenanceController.getTasksByBoilerAndDate); // ?date=YYYY-MM-DD
maintenanceRouter.post("/tasks", maintenanceController.createTask);
maintenanceRouter.put("/tasks/:id/status", maintenanceController.updateTaskStatus);

export default maintenanceRouter;
