// src/controllers/uploadController.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authType"; // Import AuthRequest nếu bạn dùng req.user
import { ApiError } from "../utils/ApiError";

export const uploadController = {
  handleImageUpload: async (
    req: AuthRequest, // Sử dụng AuthRequest nếu cần thông tin user
    res: Response,
    next: NextFunction
  ) => {
    try {
      // 1. Kiểm tra xem file đã được upload thành công bởi Multer chưa
      // Multer sẽ thêm object 'file' vào request nếu thành công
      if (!req.file) {
        throw new ApiError(400, "No image file uploaded.");
      }

      // 2. Lấy tên file đã được Multer lưu
      const filename = req.file.filename;

      // 3. Xây dựng URL công khai để truy cập file
      // URL này phụ thuộc vào cách bạn cấu hình static file serving và Multer destination
      // Ví dụ: Nếu Multer lưu vào 'public/uploads/images' và bạn serve 'public'
      // thì path công khai sẽ là '/uploads/images/'
      const publicPath = `/static/images/${filename}`;

      // Lấy base URL từ biến môi trường hoặc config
      const baseUrl = process.env.SERVER_BASE_URL || `${req.protocol}://${req.get('host')}`; // Dự phòng nếu không có biến môi trường

      const imageUrl = `${baseUrl}${publicPath}`;

      console.log(`Image uploaded successfully: ${filename}, URL: ${imageUrl}`);

      // 4. Trả về URL cho client
      res.status(200).json({
        message: "Image uploaded successfully",
        imageUrl: imageUrl, 
        filePath: publicPath // Có thể trả về cả path tương đối nếu cần
      });

    } catch (error) {
      // Chuyển lỗi cho middleware xử lý lỗi chung
      console.error("Image upload failed:", error);
      // Nếu là lỗi tự ném (ApiError) thì giữ nguyên, nếu không thì tạo lỗi 500
      if (error instanceof ApiError) {
           next(error);
      } else if (error instanceof Error) { // Bắt các lỗi khác từ Multer hoặc xử lý file
           next(new ApiError(500, `Image upload processing failed: ${error.message}`));
      } else {
           next(new ApiError(500, "An unknown error occurred during image upload."));
      }
    }
  },

  // Thêm các hàm xử lý upload loại file khác nếu cần
  // handleDocumentUpload: async (...) => { ... }
};