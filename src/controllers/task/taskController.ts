// src/controllers/tasks/taskController.ts

import { Request, Response, NextFunction } from 'express';
import { taskService } from '../../services/task/taskService';
import { ApiError } from '../../utils/ApiError';
import { AuthRequest } from '../../types/authType'; // Import kiểu AuthRequest nếu bạn dùng req.user



export const taskController = {

    // POST /tasks
    createTask: async (req: AuthRequest, res: Response, next: NextFunction) => {
        // >>> TODO: Thêm validation cho req.body dùng Joi/Zod <<<
        try {
            // Lấy userId của người tạo từ token đã xác thực
            const requesterUserId = req.user?.id;
            if (!requesterUserId) {
                throw new ApiError(401, 'User not authenticated'); // Hoặc lỗi 400 tùy logic
            }

            const taskData = { ...req.body, requesterUserId };
            const newTask = await taskService.createTask(taskData);
            res.status(201).json(newTask);
        } catch (error) {
            next(error);
        }
    },

    
    getTaskById: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                 throw new ApiError(400, 'ID công việc không hợp lệ');
            }
             // >>> TODO: Thêm kiểm tra quyền xem task này <<<
            const task = await taskService.getTaskById(id); // service đã có throw 404 nếu không tìm thấy
            res.status(200).json(task);
        } catch (error) {
            next(error);
        }
    },

    // PUT /tasks/:id
    updateTask: async (req: AuthRequest, res: Response, next: NextFunction) => {
         // >>> TODO: Thêm validation cho req.body <<<
         // Chỉ cho phép cập nhật các trường nhất định
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                throw new ApiError(400, 'ID công việc không hợp lệ');
            }
             // >>> TODO: Thêm kiểm tra quyền cập nhật task này <<<

            // Lấy các trường được phép cập nhật từ body
            const { title, description, taskType, priority, deviceId, dueDate, beforeImagePath, afterImagePath } = req.body;
            const updateData = { title, description, taskType, priority, deviceId, dueDate, beforeImagePath, afterImagePath };

            // Loại bỏ các trường undefined để không ghi đè giá trị null không mong muốn
             Object.keys(updateData).forEach(key => updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]);


            const updatedTask = await taskService.updateTask(id, updateData);
            res.status(200).json(updatedTask);
        } catch (error) {
            next(error);
        }
    },

     // PUT /tasks/:id/assign-user
     assignTaskToUser: async (req: AuthRequest, res: Response, next: NextFunction) => {
         // >>> TODO: Validation req.body.userId <<<
        try {
             const taskId = parseInt(req.params.id, 10);
             if (isNaN(taskId)) throw new ApiError(400, 'ID công việc không hợp lệ');

             const { userId } = req.body; // Lấy userId từ body
             const userIdNum = userId === null ? null : parseInt(userId, 10); // Cho phép gán null để hủy

             if (userId !== null && isNaN(userIdNum as number)) {
                 throw new ApiError(400, 'ID người dùng không hợp lệ');
             }
              // >>> TODO: Thêm kiểm tra quyền gán task <<<

             const updatedTask = await taskService.assignTaskToUser(taskId, userIdNum);
             res.status(200).json(updatedTask);

        } catch (error) {
            next(error);
        }
     },

     // PUT /tasks/:id/status
     changeTaskStatus: async (req: AuthRequest, res: Response, next: NextFunction) => {
          // >>> TODO: Validation req.body.status <<<
         try {
             const taskId = parseInt(req.params.id, 10);
             if (isNaN(taskId)) throw new ApiError(400, 'ID công việc không hợp lệ');

             const { status } = req.body;
             if (!status || typeof status !== 'string') {
                 throw new ApiError(400, 'Trạng thái mới không hợp lệ');
             }
              // >>> TODO: Thêm kiểm tra quyền thay đổi status (ví dụ: chỉ người được gán mới được đổi sang IN_PROGRESS) <<<

             const updatedTask = await taskService.changeTaskStatus(taskId, status.toUpperCase()); // Chuẩn hóa status
             res.status(200).json(updatedTask);
         } catch (error) {
            next(error);
         }
     },

      // PUT /tasks/:id/complete
     completeTask: async (req: AuthRequest, res: Response, next: NextFunction) => {
         // >>> TODO: Validation req.body <<<
         try {
             const taskId = parseInt(req.params.id, 10);
             if (isNaN(taskId)) throw new ApiError(400, 'ID công việc không hợp lệ');

             // completionData có thể chứa: completedAt, notes, afterImagePath, relatedRecordId, recordType
             const completionData = req.body;

              // >>> TODO: Thêm kiểm tra quyền hoàn thành task (ví dụ: chỉ người được gán) <<<

             const updatedTask = await taskService.completeTask(taskId, completionData);
             res.status(200).json(updatedTask);

         } catch (error) {
             next(error);
         }
     },



    deleteTask: async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                throw new ApiError(400, 'ID công việc không hợp lệ');
            }
            // >>> TODO: Thêm kiểm tra quyền xóa task <<<
            await taskService.deleteTask(id);
            res.status(204).send(); // No Content
        } catch (error) {
            next(error);
        }
    },
};