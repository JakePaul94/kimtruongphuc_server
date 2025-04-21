import { Request, Response, NextFunction } from "express";
import cleaningService from "../../services/task/cleaningService";
import { ApiError } from "../../utils/ApiError"; // Import ApiError nếu chưa có
import { AuthRequest } from "../../types/authType";
import { TaskStatusType } from "../../types/taskStatusType";

// Giả sử authMiddleware thêm thông tin user vào req.user

export const cleaningController = {
  // --- TEMPLATE Controllers (giữ nguyên) ---
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
      if (isNaN(id)) throw new ApiError(400, "Invalid template ID.");
      const template = await cleaningService.getTemplateById(id);
      res.json(template);
    } catch (err) {
      next(err);
    }
  },

  createTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Thêm validation cho req.body ở đây hoặc dùng thư viện (Joi, Zod,...)
      const template = await cleaningService.createTemplate(req.body);
      res.status(201).json(template);
    } catch (err) {
      next(err);
    }
  },

  updateTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new ApiError(400, "Invalid template ID.");
      // TODO: Thêm validation cho req.body
      const updated = await cleaningService.updateTemplate(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  deleteTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new ApiError(400, "Invalid template ID.");
      const result = await cleaningService.deleteTemplate(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  // --- TASK Controllers ---
  getAvailableTasksForMyBoilers: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id; // Lấy userId từ middleware xác thực
      if (!userId) {
        throw new ApiError(401, "Authentication required.");
      }

      const date = req.query.date as string;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ApiError(
          400,
          "Invalid or missing date query parameter. Expected format: YYYY-MM-DD"
        );
      }

      // Gọi service function mới
      const tasks = await cleaningService.getAvailableTasksForMyBoilers(
        userId,
        date
      );
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },
  // --- CONTROLLER MỚI: Lấy task được giao ---
  getMyAssignedTasks: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "Authentication required.");
      }
      const date = req.query.date as string;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ApiError(
          400,
          "Invalid or missing date query parameter. Expected format: YYYY-MM-DD"
        );
      }

      // Cần thêm hàm getAssignedTasksByDate vào service
      const tasks = await cleaningService.getAssignedTasksByDate(userId, date);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },
  // ------------------------------------------

  getTasksByDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const boilerId = parseInt(req.params.boilerId);
      if (isNaN(boilerId)) throw new ApiError(400, "Invalid boiler ID.");
      const date = req.query.date as string;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ApiError(
          400,
          "Invalid or missing date query parameter. Expected format: YYYY-MM-DD"
        );
      }
      const tasks = await cleaningService.getTasksByDate(boilerId, date);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  createTask: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const createdBy = req.user?.id; // Lấy ID người tạo từ user đã xác thực
      // TODO: Validation cho req.body (boilerId, templateId, date, scheduledDate, assignedTo?)
      const task = await cleaningService.createTask({ ...req.body, createdBy }); // Truyền createdBy vào service
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  updateTaskStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) throw new ApiError(400, "Invalid task ID.");

      const { status: statusFromBody } = req.body;
      if (!statusFromBody || typeof statusFromBody !== "string") {
        throw new ApiError(400, "Missing or invalid status in request body.");
      }

      // Kiểm tra xem statusFromBody có phải là một giá trị hợp lệ trong TaskStatusType hay không
      const allowedStatuses: TaskStatusType[] = [
        "pending",
        "in_process",
        "completed",
        "canceled",
      ];
      if (!allowedStatuses.includes(statusFromBody as TaskStatusType)) {
        throw new ApiError(
          400,
          `Invalid status value: ${statusFromBody}. Allowed values are: ${allowedStatuses.join(
            ", "
          )}`
        );
      }

      // Ép kiểu statusFromBody thành TaskStatusType (sau khi đã validation)
      const updated = await cleaningService.updateTaskStatus(
        taskId,
        statusFromBody as TaskStatusType
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
  getCleaningTaskById: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new ApiError(400, "Invalid task ID");
      }

      const task = await cleaningService.getCleaningTaskById(id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  },
  acceptTask: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const taskId = Number(req.params.id); // nếu taskId trong DB là number

      const userId = req.user?.id as number; // nếu bạn chắc chắn kiểu là number

      if (!userId) {
        throw new ApiError(401, "Authentication required.");
      }

      // Gọi service để cập nhật trạng thái task thành "in_progress"
      const task = await cleaningService.acceptTask(userId, taskId);

      if (!task) {
        throw new ApiError(404, "Task not found or cannot be accepted.");
      }

      res.json({ message: "Task accepted successfully", task });
    } catch (err) {
      next(err);
    }
  },
  // --- CONTROLLER MỚI: Hoàn thành vị trí ---
  completeTaskLocation: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const locationId = parseInt(req.params.locationId);
      if (isNaN(locationId)) {
        throw new ApiError(400, "Invalid location ID.");
      }

      const completedByUserId = req.user?.id; // Lấy ID người hoàn thành từ user đã xác thực
      if (!completedByUserId) {
        throw new ApiError(401, "Authentication required.");
      }

      const { notes,photoUrl } = req.body; // Lấy ghi chú từ body (nếu có)

      const updatedLocation = await cleaningService.completeTaskLocation(
        locationId,
        photoUrl,
        notes,
        completedByUserId
      );

      res.json(updatedLocation);
    } catch (err) {
      // Xử lý lỗi nếu có (ví dụ: xóa file đã upload nếu xử lý DB thất bại?)
      // if (req.file) { /* Xóa file fs.unlink(...) */ }
      next(err);
    }
  },
  // -----------------------------------------
};
