import express from "express";
import { boilerController } from "../controllers/boilers/boilerController";

const boilerRouter = express.Router();

// CRUD
boilerRouter.get("/", boilerController.getAllBoilers);
boilerRouter.get("/:id", boilerController.getBoilerById);
boilerRouter.post("/", boilerController.createBoiler);
boilerRouter.put("/:id", boilerController.updateBoiler);
boilerRouter.delete("/:id", boilerController.deleteBoiler);

// Quản lý user-boiler
boilerRouter.post("/assign-user", boilerController.assignUserToBoiler);
boilerRouter.delete("/remove-user", boilerController.removeUserFromBoiler);
boilerRouter.get("/:id/users", boilerController.getBoilerUsers);

// Quản lý device-boiler
boilerRouter.post("/assign-device", boilerController.assignDeviceToBoiler);
boilerRouter.delete("/remove-device", boilerController.removeDeviceFromBoiler);
boilerRouter.get("/:id/devices", boilerController.getBoilerDevices);

export default boilerRouter;
