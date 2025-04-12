import { Router } from "express";
import incidentReportController from "../controllers/device/incidentReportController";
import { getMulterUploader } from "../middlewares/multerConfig";

const incidentRouter = Router();
const upload = getMulterUploader('incidents');
incidentRouter.get("/", incidentReportController.getAll);
incidentRouter.get("/:id", incidentReportController.getById);
incidentRouter.post("/",upload.array('photos', 10) , incidentReportController.create);
incidentRouter.put("/:id/status", incidentReportController.updateStatus);
incidentRouter.delete("/:id", incidentReportController.delete);

export default incidentRouter;
