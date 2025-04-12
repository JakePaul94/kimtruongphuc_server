import { Request, Response, NextFunction } from "express";
import cleaningService from "../../services/task/cleaningService";
import adHocTaskService from "../../services/task/adHocTaskService";
import inspectionService from "../../services/task/inspectionService";
import maintenanceService from "../../services/task/maintenanceService";
import waterReportService from "../../services/task/waterReportService";
import { ApiError } from "../../utils/ApiError"; // Import ApiError nếu chưa có
import { AuthRequest } from "../../types/authType";
import boilerService from "../../services/boilers/boilerService";
import { w } from "@faker-js/faker/dist/airline-CBNP41sR";

export const TaskController = {
  getAllTaskToday: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;
    const dateFromQuery = req.query.date as string;
    const allTasks: any[] = []; // Assuming date is always present
    if (!user) {
      return next(new ApiError(401, "Unauthorized"));
    }
    try {
      const boilerId = await boilerService.getBoilerIdByUserId(user.id);
      const cleaningTaskById = await cleaningService.getAssignedTasksByDate(
        user.id,
        dateFromQuery
      );
      const adHocTaskById = await adHocTaskService.getTasksByUserAndDate(
        user.id,
        dateFromQuery
      );

      cleaningTaskById.forEach((task) => {
        allTasks.push({
          id: task.id,
          type: "cleaning",
          assignmentType: "assigned",
          title: `Vệ sinh lò hơi ${task.boilerId}`,
          description: null,
          scheduledDate: task.scheduledDate,
          status: task.status,
          assignedTo: task.assignedTo,
          createdBy: task.createdBy,
          completedAt: task.completedAt,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          boilerId: task.boilerId,
          deviceId: null,
        });
      });

      adHocTaskById.forEach((task) => {
        allTasks.push({
          id: task.id,
          type: "ad-hoc",
          assignmentType: "assigned",
          title: task.title,
          description: task.description,
          scheduledDate: task.scheduledDate,
          status: task.status,
          assignedTo: task.assignedTo,
          createdBy: task.createdBy,
          completedAt: undefined,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          boilerId: task.boilerId,
          deviceId: task.deviceId,
        });
      });

      if (boilerId) {
        const [
          cleaningTasksForBoiler,
          adHocTasksForBoiler,
          inspectionTasksForBoiler,
          maintenanceTasksForBoiler,
          waterReportTasksForBoiler,
        ] = await Promise.all([
          cleaningService.getAvailableTasksForMyBoilers(
            boilerId,
            dateFromQuery
          ),
          adHocTaskService.getTasksByBoilerAndDate(boilerId, dateFromQuery),
          inspectionService.getInspectionTasksByBoilerAndDate(
            boilerId,
            dateFromQuery
          ),
          maintenanceService.getMaintenanceTasksByBoilerAndDate(
            boilerId,
            dateFromQuery
          ),
          waterReportService.getAvailableTasksForMyBoilers(
            user.id,
            dateFromQuery
          ),
        ]);

        cleaningTasksForBoiler.forEach((task) => {
          allTasks.push({
            id: task.id,
            type: "cleaning",
            assignmentType: "available",
            title: `Vệ sinh lò hơi ${task.boilerId}`,
            description: null,
            scheduledDate: task.scheduledDate,
            status: task.status,
            assignedTo: task.assignedTo,
            createdBy: task.createdBy,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            boilerId: task.boilerId,
            deviceId: null,
          });
        });

        adHocTasksForBoiler.forEach((task) => {
          allTasks.push({
            id: task.id,
            type: "ad-hoc",
            assignmentType: "available",
            title: task.title,
            description: task.description,
            scheduledDate: task.scheduledDate,
            status: task.status,
            assignedTo: task.assignedTo,
            createdBy: task.createdBy,
            completedAt: undefined,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            boilerId: task.boilerId,
            deviceId: task.deviceId,
          });
        });

        inspectionTasksForBoiler.forEach((task) => {
          allTasks.push({
            id: task.id,
            type: "inspection",
            assignmentType: "available",
            title: `Kiểm tra thiết bị ${task.deviceId}`,
            description: null,
            scheduledDate: task.scheduledDate,
            status: task.status,
            assignedTo: task.assignedTo,
            createdBy: task.createdBy,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            boilerId: null,
            deviceId: task.deviceId,
          });
        });

        maintenanceTasksForBoiler.forEach((task) => {
          allTasks.push({
            id: task.id,
            type: "maintenance",
            assignmentType: "available",
            title: `Bảo trì thiết bị ${task.deviceId}`,
            description: task.notes,
            scheduledDate: task.scheduledDate,
            status: task.status,
            assignedTo: task.assignedTo,
            createdBy: task.createdBy,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            boilerId: null,
            deviceId: task.deviceId,
          });
        });
        waterReportTasksForBoiler.forEach((task) => {
          allTasks.push({
            id: task.id,
            type: "water-report",
            assignmentType: "available",
            title: `Báo cáo nước ${task.boilerId}`,
            description: null,
            scheduledDate: task.scheduledDate,
            status: task.status,
            assignedTo: task.assignedTo,
            createdBy: task.createdBy,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            boilerId: task.boilerId,
            deviceId: null,
          });
        });
      }

      res.status(200).json(allTasks);
    } catch (error: any) {
      console.error("Error fetching all tasks for today:", error);
      return next(new ApiError(500, "Failed to fetch tasks for today."));
    }
  },
};
export default TaskController;
