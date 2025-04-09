import { Request, Response, NextFunction } from "express";
import incidentReportService from "../../services/devices/incidentReportService";

const incidentReportController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reports = await incidentReportService.getAllReports();
      res.json(reports);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await incidentReportService.getReportById(Number(req.params.id));
      res.json(report);
    } catch (err) {
      next(err);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await incidentReportService.createReport(req.body);
      res.status(201).json(report);
    } catch (err) {
      next(err);
    }
  },

  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const updated = await incidentReportService.updateStatus(Number(req.params.id), status);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await incidentReportService.deleteReport(Number(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};

export default incidentReportController;
