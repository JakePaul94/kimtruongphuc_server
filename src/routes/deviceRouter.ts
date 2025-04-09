import express from "express";
import { deviceController } from "../controllers/device/deviceController";

const deviceRouter = express.Router();

deviceRouter.post("/", deviceController.createDevice);
deviceRouter.get("/", deviceController.getAllDevices);
deviceRouter.get("/:id", deviceController.getDeviceById);
deviceRouter.put("/:id", deviceController.updateDevice);
deviceRouter.delete("/:id", deviceController.deleteDevice);
deviceRouter.get("/:id/sub-devices", deviceController.getSubDevices);
deviceRouter.get("/:id/maintenance-tasks", deviceController.getDeviceMaintenanceTasks);
deviceRouter.get("/:id/inspection-tasks", deviceController.getDeviceInspectionTasks);
deviceRouter.get("/:id/documents", deviceController.getDeviceDocuments);

export default deviceRouter;