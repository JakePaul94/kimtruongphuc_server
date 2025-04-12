import express from "express";
import { deviceController } from "../controllers/device/deviceController";
import { isAuthenticated } from "../middlewares/authMiddleware";

const deviceRouter = express.Router();

deviceRouter.post("/create", deviceController.createDevice);
deviceRouter.get("/", deviceController.getAllDevices);
deviceRouter.get("/device/:id", deviceController.getDeviceById);
deviceRouter.put("/device/:id", deviceController.updateDevice);
deviceRouter.delete("/device/:id", deviceController.deleteDevice);
deviceRouter.get("/:id/sub-devices", deviceController.getSubDevices);
deviceRouter.get("/:id/maintenance-tasks", deviceController.getDeviceMaintenanceTasks);
deviceRouter.get("/:id/inspection-tasks", deviceController.getDeviceInspectionTasks);
deviceRouter.get("/:id/documents", deviceController.getDeviceDocuments);
deviceRouter.get("/for-my-boiler",isAuthenticated, deviceController.getDevicesByUserId);

export default deviceRouter;