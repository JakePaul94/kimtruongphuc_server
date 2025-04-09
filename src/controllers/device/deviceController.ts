import { Request, Response, NextFunction } from "express";
import { deviceService } from "../../services/devices/deviceService";
import { ApiError } from "../../utils/ApiError";

export const deviceController = {
  createDevice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const device = await deviceService.createDevice(req.body);
      res.status(201).json(device);
    } catch (err) {
      next(err);
    }
  },

  getAllDevices: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset, order, ...filter } = req.query;
      const result = await deviceService.getAllDevices({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        order: order ? JSON.parse(order as string) : undefined,
        filter: filter as any,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  getDeviceById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const device = await deviceService.getDeviceById(id);
      if (!device) {
        throw new ApiError(404, "Không tìm thấy thiết bị");
      }
      res.json(device);
    } catch (err) {
      next(err);
    }
  },

  updateDevice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await deviceService.updateDevice(id, req.body);
      if (!updated) {
        throw new ApiError(404, "Không tìm thấy thiết bị để cập nhật");
      }
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  deleteDevice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await deviceService.deleteDeviceById(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  getSubDevices: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = parseInt(req.params.id);
      const subs = await deviceService.getSubDevices(parentId);
      res.json(subs);
    } catch (err) {
      next(err);
    }
  },

  getDeviceMaintenanceTasks: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const deviceId = parseInt(req.params.id);
      const records = await deviceService.getDeviceMaintenanceTasks(deviceId);
      res.json(records);
    } catch (err) {
      next(err);
    }
  },

  getDeviceInspectionTasks: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const deviceId = parseInt(req.params.id);
      const records = await deviceService.getDeviceInspectionTasks(deviceId);
      res.json(records);
    } catch (err) {
      next(err);
    }
  },

  getDeviceDocuments: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const deviceId = parseInt(req.params.id);
      const docs = await deviceService.getDeviceDocuments(deviceId);
      res.json(docs);
    } catch (err) {
      next(err);
    }
  },
};
