import { Request, Response, NextFunction } from "express";
import adHocTaskService from "../../services/task/adHocTaskService";

export const adHocTaskController = {
  getTasksByBoilerAndDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const boilerId = parseInt(req.params.boilerId);
      const date = req.query.date as string;
      const tasks = await adHocTaskService.getTasksByBoilerAndDate(boilerId, date);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  getTasksByUserAndDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = req.query.date as string;
      const tasks = await adHocTaskService.getTasksByUserAndDate(userId, date);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  createTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await adHocTaskService.createTask(req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  updateTaskStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await adHocTaskService.updateTaskStatus(taskId, status);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  addTaskLog: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { adHocTaskId, createdBy, note, photoUrl } = req.body;
      const log = await adHocTaskService.addTaskLog(adHocTaskId, createdBy, note, photoUrl);
      res.status(201).json(log);
    } catch (err) {
      next(err);
    }
  },

  deleteTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.id);
      const result = await adHocTaskService.deleteTask(taskId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
