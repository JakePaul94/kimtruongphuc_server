import express from "express";
import { boilerController } from "../controllers/boilers/boilerController";

const boilerRouter = express.Router();

//Innitial
boilerRouter.get("/users", boilerController.getAllBoierUsers);
boilerRouter.get("/devices", boilerController.getAllBoierDevices);
// CRUD
boilerRouter.get("/", boilerController.getAllBoilers);
boilerRouter.get("/:id", boilerController.getBoilerById);
boilerRouter.post("/create", boilerController.createBoiler);
boilerRouter.put("/:id", boilerController.updateBoiler);
boilerRouter.delete("/:id", boilerController.deleteBoiler);

// Quản lý user-boiler
boilerRouter.post("/assign-user", boilerController.assignUserToBoiler);
boilerRouter.delete('/:boilerId/users/:userId', boilerController.removeUserFromBoiler);
boilerRouter.get("/:boilerId/users", boilerController.getBoilerUsers);

// Quản lý device-boiler
boilerRouter.post("/assign-device", boilerController.assignDeviceToBoiler);
boilerRouter.post("/:boilerId/devices", boilerController.createDeviceToBoiler);
boilerRouter.delete('/:boilerId/devices/:deviceId', boilerController.removeDeviceFromBoiler);
boilerRouter.get("/:boilerId/devices", boilerController.getBoilerDevices);


export default boilerRouter;
