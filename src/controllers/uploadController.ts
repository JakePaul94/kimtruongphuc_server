// src/controllers/uploadController.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authType"; // Import AuthRequest nếu bạn dùng req.user
import { ApiError } from "../utils/ApiError";
import fs from "fs";
import path from "path";

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
  }
  ,
  handleImageDelete: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        throw new ApiError(400, "Image URL is required.");
      }

      // Giải mã URL => lấy ra filename từ public path
      // Ví dụ: /static/images/abc123.png => abc123.png
      const publicPathPrefix = "/static/images/";
      if (!imageUrl.includes(publicPathPrefix)) {
        throw new ApiError(400, "Invalid image URL format.");
      }

      const filename = imageUrl.split(publicPathPrefix)[1];
      const filePath = path.join(__dirname, "..", "uploads", "images", filename);

      // Kiểm tra file tồn tại và xóa
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
          return next(new ApiError(500, "Failed to delete image file."));
        }

        res.status(200).json({
          message: "Image deleted successfully",
          deletedFile: filename,
        });
      });
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
      } else if (error instanceof Error) {
        next(new ApiError(500, `Image deletion failed: ${error.message}`));
      } else {
        next(new ApiError(500, "Unknown error occurred during image deletion."));
      }
    }
  }
  // Thêm các hàm xử lý upload loại file khác nếu cần
  // handleDocumentUpload: async (...) => { ... }
};