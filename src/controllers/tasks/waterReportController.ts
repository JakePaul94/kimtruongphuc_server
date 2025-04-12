import { Request, Response, NextFunction } from "express";
import waterReportService from "../../services/task/waterReportService"
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../types/authType"; // Giữ nguyên nếu dùng cùng kiểu AuthRequest
import { TaskStatusType } from "../../types/taskStatusType"; // Giữ nguyên TaskStatusType

// --- Controller Object ---
export const waterReportController = {
  // =========================================
  // TEMPLATE Controllers
  // =========================================

  getAllTemplates: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templates = await waterReportService.getAllTemplates();
      res.json(templates);
    } catch (err) {
      next(err); // Chuyển lỗi cho error handling middleware
    }
  },

  getTemplateById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new ApiError(400, "Invalid template ID.");
      const template = await waterReportService.getTemplateById(id);
      res.json(template);
    } catch (err) {
      next(err);
    }
  },

  createTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Thêm validation chi tiết cho req.body (dùng Joi, Zod, hoặc check thủ công)
      // Ví dụ: kiểm tra name, boilerId, items (label) có tồn tại và đúng kiểu không.
      if (!req.body.name || !req.body.boilerId) {
          throw new ApiError(400, "Missing required fields: name, boilerId.");
      }
      // Gọi service với req.body đã được validate (hoặc service sẽ validate lại)
      const template = await waterReportService.createTemplate(req.body); // createTemplate giờ nhận cả items
      res.status(201).json(template);
    } catch (err) {
      next(err);
    }
  },

  updateTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new ApiError(400, "Invalid template ID.");
      // TODO: Thêm validation cho req.body. Lưu ý service updateTemplate hiện tại
      // chỉ cập nhật trường của template, không xử lý items phức tạp.
      const updated = await waterReportService.updateTemplate(id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  deleteTemplate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new ApiError(400, "Invalid template ID.");
      const result = await waterReportService.deleteTemplate(id);
      res.json(result); // Trả về { message: "..." }
    } catch (err) {
      next(err);
    }
  },

  // =========================================
  // TASK Controllers
  // =========================================

  // Lấy các task CHƯA GÁN theo ngày cho các lò user quản lý
  getAvailableTasksForMyBoilers: async (
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
      // Validation format YYYY-MM-DD
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ApiError(400, "Invalid or missing date query parameter. Expected format: YYYY-MM-DD");
      }

      const tasks = await waterReportService.getAvailableTasksForMyBoilers(userId, date);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  // Lấy các task ĐÃ ĐƯỢC GÁN cho user hiện tại theo ngày
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
        throw new ApiError(400, "Invalid or missing date query parameter. Expected format: YYYY-MM-DD");
      }

      // Gọi service function tương ứng
      const tasks = await waterReportService.getAssignedTasksByDate(userId, date);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  // Lấy TẤT CẢ tasks theo boiler và ngày (thường dùng cho admin/quản lý)
  getTasksByDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Lấy boilerId từ route params thay vì body/query nếu route là /boilers/:boilerId/tasks
      const boilerId = parseInt(req.params.boilerId);
      if (isNaN(boilerId)) throw new ApiError(400, "Invalid boiler ID in route parameter.");

      const date = req.query.date as string;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ApiError(400, "Invalid or missing date query parameter. Expected format: YYYY-MM-DD");
      }
      const tasks = await waterReportService.getTasksByDate(boilerId, date);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  // Tạo task mới
  createTask: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const createdBy = req.user?.id;
      if (!createdBy) {
           throw new ApiError(401, "Authentication required to create task.");
      }
      // TODO: Validation chi tiết cho req.body (boilerId, templateId, scheduledDate là bắt buộc)
      const { boilerId, templateId, scheduledDate, assignedTo } = req.body;
       if (!boilerId || !templateId || !scheduledDate) {
           throw new ApiError(400, "Missing required fields: boilerId, templateId, scheduledDate.");
       }
       // Validate date format
       if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
            throw new ApiError(400, "Invalid scheduledDate format. Expected: YYYY-MM-DD");
       }

      // Truyền createdBy vào service
      const task = await waterReportService.createTask({
          boilerId,
          templateId,
          scheduledDate,
          assignedTo: assignedTo || null, // Đảm bảo là null nếu không được cung cấp
          createdBy
       });
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  // Cập nhật trạng thái task (thường dùng cho admin hoặc để cancel)
  updateTaskStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Lấy taskId từ route params
      const taskId = parseInt(req.params.taskId); // Giả sử route là /tasks/:taskId/status
      if (isNaN(taskId)) throw new ApiError(400, "Invalid task ID.");

      const { status: statusFromBody } = req.body;
      if (!statusFromBody || typeof statusFromBody !== "string") {
        throw new ApiError(400, "Missing or invalid status in request body.");
      }

      // Kiểm tra giá trị status hợp lệ
      const allowedStatuses: TaskStatusType[] = ['pending', 'in_process', 'completed', 'canceled'];
      if (!allowedStatuses.includes(statusFromBody as TaskStatusType)) {
        throw new ApiError(400, `Invalid status value: ${statusFromBody}. Allowed values are: ${allowedStatuses.join(', ')}`);
      }

      const updatedTask = await waterReportService.updateTaskStatus(taskId, statusFromBody as TaskStatusType);
      res.json(updatedTask);

    } catch (err) {
      next(err);
    }
  },

  // User nhận (claim) một task
  acceptTask: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Lấy taskId từ route params
      const taskId = parseInt(req.params.taskId); // Giả sử route là /tasks/:taskId/accept
       if (isNaN(taskId)) throw new ApiError(400, "Invalid task ID.");

      const userId = req.user?.id;
      if (!userId) {
        throw new ApiError(401, "Authentication required.");
      }

      // Gọi service để user nhận task
      const task = await waterReportService.acceptTask(userId, taskId);

      // Service sẽ throw lỗi nếu không tìm thấy hoặc task đã được nhận
      res.json({ message: "Water report task accepted successfully", task });
    } catch (err) {
      next(err);
    }
  },

  // User hoàn thành một mục trong task (gửi kết quả)
  completeTaskItem: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Lấy taskItemId từ route params
      const taskItemId = parseInt(req.params.itemId); // Giả sử route là /tasks/items/:itemId/complete
      if (isNaN(taskItemId)) {
        throw new ApiError(400, "Invalid task item ID.");
      }

      const completedByUserId = req.user?.id;
      if (!completedByUserId) {
        throw new ApiError(401, "Authentication required.");
      }

      // Lấy dữ liệu từ body và file (nếu có)
      const { notes, isQualify, valueFromAI } = req.body;
      let imageUrl: string | undefined | null = undefined;

      // Xử lý file upload nếu có
      if (req.file) {
        // Cách xây dựng URL/path phụ thuộc vào cấu hình lưu trữ của bạn
        // Ví dụ: lưu vào thư mục uploads/water_report_images/
        imageUrl = `/uploads/water_report_images/${req.file.filename}`;
         console.log(`Image uploaded for task item ${taskItemId}: ${imageUrl}`);
      }

      // Parse isQualify từ string hoặc boolean (nếu gửi từ form data)
      let parsedIsQualify: boolean | undefined | null = undefined;
      if (isQualify !== undefined && isQualify !== null) {
        if (typeof isQualify === 'string') {
           if (isQualify.toLowerCase() === 'true') parsedIsQualify = true;
           else if (isQualify.toLowerCase() === 'false') parsedIsQualify = false;
           else throw new ApiError(400, "Invalid boolean value for isQualify. Use 'true' or 'false'.");
        } else if (typeof isQualify === 'boolean') {
            parsedIsQualify = isQualify;
        } else {
             throw new ApiError(400, "Invalid type for isQualify. Expected boolean or string ('true'/'false').");
        }
      }


      // TODO: Validation thêm cho các trường dữ liệu (notes, valueFromAI) nếu cần

      // Gọi service để hoàn thành item
      const updatedTaskItem = await waterReportService.completeTaskItem(
        taskItemId,
        {
          imageUrl: imageUrl, // Có thể là undefined nếu không có file upload
          valueFromAI: valueFromAI || null, // Đảm bảo là null nếu không có
          isQualify: parsedIsQualify, // Đã parse
          notes: notes || null, // Đảm bảo là null nếu không có
        },
        completedByUserId
      );

      res.json(updatedTaskItem);
    } catch (err) {
      // Quan trọng: Xử lý lỗi upload file nếu cần
      // Ví dụ: Nếu service báo lỗi sau khi file đã upload, có thể cần xóa file đó đi
      if (req.file && err instanceof ApiError /* && err.statusCode >= 500 */ ) {
         const fs = require('fs');
         const path = require('path');
         const filePath = path.join(__dirname, '../../..', req.file.path); // Điều chỉnh đường dẫn nếu cần
         fs.unlink(filePath, (unlinkErr: any) => {
             if (unlinkErr) console.error("Error deleting uploaded file after failed operation:", unlinkErr);
         });
      }
      next(err);
    }
  },
}; 