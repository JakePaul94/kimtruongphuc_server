import express from "express";
import { adHocTaskController } from "../../controllers/tasks/adHocTaskController";

const adHocTaskRouter = express.Router();

// 📌 Lấy task theo boilerId và ngày: /boiler/:boilerId/tasks?date=YYYY-MM-DD
adHocTaskRouter.get("/boiler/:boilerId/tasks", adHocTaskController.getTasksByBoilerAndDate);

// 📌 Lấy task theo userId và ngày: /user/:userId/tasks?date=YYYY-MM-DD
adHocTaskRouter.get("/user/:userId/tasks", adHocTaskController.getTasksByUserAndDate);
// 📌 Lấy chi tiết một task theo ID
adHocTaskRouter.get("/:id", adHocTaskController.getTaskById);

// 📌 Cập nhật thông tin task
adHocTaskRouter.put("/:id", adHocTaskController.updateTaskInfo);

// 📌 Lấy toàn bộ log của một task
adHocTaskRouter.get("/:id/logs", adHocTaskController.getLogsByTaskId);
// 📌 Tạo task
adHocTaskRouter.post("/", adHocTaskController.createTask);

// 📌 Cập nhật trạng thái task
adHocTaskRouter.put("/:id/status", adHocTaskController.updateTaskStatus);

// 📌 Thêm log cho task
adHocTaskRouter.post("/log", adHocTaskController.addTaskLog);

// 📌 Xoá task
adHocTaskRouter.delete("/:id", adHocTaskController.deleteTask);

export default adHocTaskRouter;
