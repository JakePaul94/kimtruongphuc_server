// src/routes/uploadRoutes.ts
import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware";
import { getMulterUploader } from "../middlewares/multerConfig";
import { uploadController } from "../controllers/uploadController"; // Import controller vừa tạo

const uploadRouter = express.Router();

// Cấu hình Multer cho việc upload ảnh vào thư mục 'images' (ví dụ: public/uploads/images)
// 'images' là prefix thư mục con trong thư mục uploads chính của bạn
const uploadImage = getMulterUploader("images"); // Đảm bảo prefix này đúng

// Định nghĩa route POST để upload ảnh
uploadRouter.post(
  "/image", // Path sẽ là /api/uploads/image nếu bạn mount router với prefix /api/uploads
  isAuthenticated,                 // 1. Xác thực người dùng
  uploadImage.single("image"), // 2. Dùng Multer xử lý file upload từ field có tên 'imageFile'
  uploadController.handleImageUpload // 3. Gọi controller để xử lý kết quả và trả về URL
);

// Thêm các route upload khác nếu cần (ví dụ: /document)
// uploadRouter.post(
//   "/document",
//   isAuthenticated,
//   uploadDocument.single("docFile"), // Dùng cấu hình Multer khác nếu cần
//   uploadController.handleDocumentUpload
// );

export default uploadRouter;