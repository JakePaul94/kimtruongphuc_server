import { Request, Response, NextFunction } from "express";
import boilerService from "../../services/boilers/boilerService";

export const boilerController = {
  getAllBoilers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const boilers = await boilerService.getAllBoilers();
      res.json(boilers);
    } catch (err) {
      next(err);
    }
  },

  getBoilerById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Boiler ID:", id); // Log the boiler ID
      const boiler = await boilerService.getBoilerById(id);
      res.json(boiler);
    } catch (err) {
      next(err);
    }
  },

  createBoiler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const boiler = await boilerService.createBoiler(req.body);
      res.status(201).json(boiler);
    } catch (err) {
      next(err);
    }
  },

  updateBoiler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await boilerService.updateBoiler(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  deleteBoiler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await boilerService.deleteBoiler(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  assignUserToBoiler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { boilerId, userId } = req.body;
      const result = await boilerService.assignUserToBoiler(boilerId, userId);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  removeUserFromBoiler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { boilerId, userId } = req.body;
      await boilerService.removeUserFromBoiler(boilerId, userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  getBoilerUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const boilerId = parseInt(req.params.id);
      const users = await boilerService.getBoilerUsers(boilerId);
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  assignDeviceToBoiler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { boilerId, deviceId } = req.body;
      const result = await boilerService.assignDeviceToBoiler(boilerId, deviceId);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  removeDeviceFromBoiler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { boilerId, deviceId } = req.body;
      await boilerService.removeDeviceFromBoiler(boilerId, deviceId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  getBoilerDevices: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const boilerId = parseInt(req.params.id);
      const devices = await boilerService.getBoilerDevices(boilerId);
      res.json(devices);
    } catch (err) {
      next(err);
    }
  },
};
