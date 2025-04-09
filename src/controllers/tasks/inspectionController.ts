import { Request, Response, NextFunction } from "express";
import inspectionService from "../../services/task/inspectionService";

export const inspectionController = {
  // 📌 TEMPLATE

  getAllTemplates: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templates = await inspectionService.getAllTemplates();
      res.json(templates);
    } catch (err) {
      next(err);
    }
  },

  getTemplateById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const template = await inspectionService.getTemplateById(id);
      res.json(template);
    } catch (err) {
      next(err);
    }
  },

  createTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await inspectionService.createTemplate(req.body);
      res.status(201).json(template);
    } catch (err) {
      next(err);
    }
  },

  updateTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await inspectionService.updateTemplate(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  deleteTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const result = await inspectionService.deleteTemplate(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  // 📌 TASK

  getTasksByBoilerAndDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const boilerId = parseInt(req.params.boilerId);
      const date = req.query.date as string;
      const tasks = await inspectionService.getInspectionTasksByBoilerAndDate(
        boilerId,
        date
      );
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  createTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await inspectionService.createTask(req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  updateTaskStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await inspectionService.updateTaskStatus(taskId, status);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};
