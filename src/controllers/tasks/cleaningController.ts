import { Request, Response, NextFunction } from "express";
import cleaningService from "../../services/task/cleaningService"

export const cleaningController = {
  // 📌 TEMPLATE

  getAllTemplates: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templates = await cleaningService.getAllTemplates();
      res.json(templates);
    } catch (err) {
      next(err);
    }
  },

  getTemplateById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const template = await cleaningService.getTemplateById(id);
      res.json(template);
    } catch (err) {
      next(err);
    }
  },

  createTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await cleaningService.createTemplate(req.body);
      res.status(201).json(template);
    } catch (err) {
      next(err);
    }
  },

  updateTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await cleaningService.updateTemplate(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  deleteTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const result = await cleaningService.deleteTemplate(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  // 📌 TASK

  getTasksByDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const boilerId = parseInt(req.params.boilerId);
      const date = req.query.date as string;
      const tasks = await cleaningService.getTasksByDate(boilerId, date);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  createTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await cleaningService.createTask(req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  updateTaskStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await cleaningService.updateTaskStatus(taskId, status);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};
