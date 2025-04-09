import { Router } from "express";
import incidentReportController from "../controllers/device/incidentReportController";

const incidentRouter = Router();

incidentRouter.get("/", incidentReportController.getAll);
incidentRouter.get("/:id", incidentReportController.getById);
incidentRouter.post("/", incidentReportController.create);
incidentRouter.put("/:id/status", incidentReportController.updateStatus);
incidentRouter.delete("/:id", incidentReportController.delete);

export default incidentRouter;
