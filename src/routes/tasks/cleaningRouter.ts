import express from "express";
import { cleaningController } from "../../controllers/tasks/cleaningController";
import { getMulterUploader } from "../../middlewares/multerConfig";
import { isAuthenticated } from "../../middlewares/authMiddleware"; // Giả sử bạn có middleware này
import { requireRole } from "../../middlewares/requireRoleMiddleware";

const cleaningRouter = express.Router();

// Cấu hình Multer cho việc upload ảnh cleaning task
// Prefix 'cleaning' sẽ tạo thư mục con ví dụ: uploads/cleaning_photos/
const uploadCleaningPhoto = getMulterUploader("cleaning_photos"); // Đặt tên thư mục rõ ràng hơn

// 📌 TEMPLATE routes (giữ nguyên)
cleaningRouter.get(
  "/templates",
  isAuthenticated,
  cleaningController.getAllTemplates
); // Thêm auth nếu cần
cleaningRouter.get(
  "/templates/:id",
  isAuthenticated,
  cleaningController.getTemplateById
); // Thêm auth nếu cần
cleaningRouter.post(
  "/templates",
  requireRole("admin"), // Middleware kiểm tra quyền admin
  cleaningController.createTemplate
); // Thêm auth nếu cần
cleaningRouter.put(
  "/templates/:id",
  isAuthenticated,
  cleaningController.updateTemplate
); // Thêm auth nếu cần
cleaningRouter.delete(
  "/templates/:id",
  isAuthenticated,
  cleaningController.deleteTemplate
); // Thêm auth nếu cần

// 📌 TASK routes
cleaningRouter.get(
  "/tasks/my-boilers/available", // Path mới
  isAuthenticated, // Middleware xác thực
  cleaningController.getAvailableTasksForMyBoilers // Controller function mới
);
cleaningRouter.get("/tasks/:id", isAuthenticated, cleaningController.getCleaningTaskById); // Thêm auth nếu cần
cleaningRouter.get(
  "/tasks/assigned/me",
  isAuthenticated,
  cleaningController.getMyAssignedTasks
); // <-- ROUTE MỚI: Lấy task được giao cho tôi
cleaningRouter.get(
  "/tasks/:boilerId",
  isAuthenticated,
  cleaningController.getTasksByDate
); // ?date=YYYY-MM-DD // Thêm auth nếu cần

cleaningRouter.post("/tasks", isAuthenticated, cleaningController.createTask); // Thêm auth nếu cần
cleaningRouter.put(
  "/tasks/:id/status",
  isAuthenticated,
  cleaningController.updateTaskStatus
); // Thêm auth nếu cần

// --- ROUTE MỚI: Hoàn thành một vị trí trong task ---
cleaningRouter.put(
  "/tasks/locations/:locationId/complete", // Dùng path param cho locationId
  isAuthenticated, 
  cleaningController.completeTaskLocation // 3. Gọi controller xử lý
);
// -------------------------------------------------
cleaningRouter.put(
    "/tasks/:id/accept", // Path để nhận việc
    isAuthenticated, // Xác thực người dùng
    cleaningController.acceptTask // Controller xử lý việc nhận task
  );
export default cleaningRouter;
