import express from "express";
// Đổi controller import
import { waterReportController } from "../../controllers/tasks/waterReportController";
import { getMulterUploader } from "../../middlewares/multerConfig";
import { isAuthenticated } from "../../middlewares/authMiddleware"; // Giữ nguyên middleware auth
import { requireRole } from "../../middlewares/requireRoleMiddleware"; // Giữ nguyên middleware role

const waterReportRouter = express.Router();

// Cấu hình Multer cho việc upload ảnh water report task item
// Prefix 'water_report' sẽ tạo thư mục con ví dụ: uploads/water_report_images/
const uploadWaterReportImage = getMulterUploader("water_report_images"); // Đặt tên thư mục rõ ràng

// =========================================
// TEMPLATE Routes
// =========================================
// Áp dụng middleware tương tự cleaningRouter cho templates
waterReportRouter.get(
  "/templates",
  isAuthenticated, // Cần đăng nhập để xem templates
  waterReportController.getAllTemplates
);

waterReportRouter.get(
  "/templates/:id",
  isAuthenticated, // Cần đăng nhập
  waterReportController.getTemplateById
);

waterReportRouter.post(
  "/templates",
  requireRole("admin"), // Chỉ admin được tạo template
  waterReportController.createTemplate
);

waterReportRouter.put(
  "/templates/:id",
  requireRole("admin"), // Chỉ admin được sửa template
  waterReportController.updateTemplate
);

waterReportRouter.delete(
  "/templates/:id",
  requireRole("admin"), // Chỉ admin được xóa template
  waterReportController.deleteTemplate
);

// =========================================
// TASK Routes
// =========================================

// Lấy các task CHƯA GÁN theo ngày cho các lò user quản lý
waterReportRouter.get(
  "/tasks/my-boilers/available", // Giữ nguyên path hoặc điều chỉnh nếu cần
  isAuthenticated,
  waterReportController.getAvailableTasksForMyBoilers // Controller tương ứng
);

// Lấy các task ĐÃ ĐƯỢC GÁN cho user hiện tại theo ngày
waterReportRouter.get(
  "/tasks/assigned/me", // Giữ nguyên path
  isAuthenticated,
  waterReportController.getMyAssignedTasks // Controller tương ứng
);

// Lấy TẤT CẢ tasks theo boiler và ngày (thường dùng cho admin/quản lý)
// Sử dụng path /boilers/:boilerId/tasks để rõ ràng hơn
waterReportRouter.get(
  "/boilers/:boilerId/tasks", // Path rõ ràng hơn
  isAuthenticated, // Có thể thêm requireRole('manager') nếu cần
  waterReportController.getTasksByDate // Controller tương ứng (?date=YYYY-MM-DD)
);

// Tạo task mới (thường do admin/quản lý tạo)
waterReportRouter.post(
  "/tasks",
  requireRole("admin"), // Admin hoặc Manager có thể tạo task
  waterReportController.createTask
);

// Cập nhật trạng thái của task (thường do admin/quản lý)
// Sử dụng :taskId để rõ ràng
waterReportRouter.put(
  "/tasks/:taskId/status",
  requireRole("admin"), // Chỉ admin/manager được cập nhật status trực tiếp
  waterReportController.updateTaskStatus
);

// User nhận (claim) một task
// Sử dụng :taskId
waterReportRouter.put(
  "/tasks/:taskId/accept", // Path để nhận việc
  isAuthenticated, // Bất kỳ user nào đăng nhập cũng có thể thử nhận việc (service sẽ kiểm tra logic)
  waterReportController.acceptTask // Controller xử lý việc nhận task
);

// User hoàn thành một MỤC (item) trong task
// Sử dụng :itemId
waterReportRouter.put(
  "/tasks/items/:itemId/complete", // Path dùng itemId
  isAuthenticated, // 1. Xác thực người dùng
  uploadWaterReportImage.single("reportImage"), // 2. Xử lý upload 1 file ảnh với field name là 'reportImage' (hoặc tên khác bạn chọn)
  waterReportController.completeTaskItem // 3. Gọi controller xử lý item completion
);

export default waterReportRouter;