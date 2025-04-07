// src/services/tasks/taskService.test.ts

import {
    TaskAttributes,
  TaskCreationAttributes,
  TaskInstance,
} from "../../models/tasks/taskModel";
import { ApiError } from "../../utils/ApiError";

// --- Mocking Dependencies ---

// Mock các phương thức của model Task mà service sẽ gọi
const mockTaskCreate = jest.fn();
const mockTaskFindByPk = jest.fn();
const mockTaskFindOne = jest.fn();
const mockTaskFindAndCountAll = jest.fn();
const mockTaskUpdate = jest.fn();
const mockTaskDestroy = jest.fn();
// Mock phương thức của instance (ví dụ: reload, update, destroy)
// Lưu ý: mock `reload` thường trả về `this` (instance hiện tại) để giả lập
const mockInstanceReload = jest.fn().mockImplementation(function (this: any) {
  return Promise.resolve(this);
});
const mockInstanceUpdate = jest.fn();
const mockInstanceDestroy = jest.fn();

// Mock toàn bộ module config/database và object models
jest.mock("../../config/database", () => ({
  models: {
    Task: {
      create: mockTaskCreate,
      findByPk: mockTaskFindByPk,
      findOne: mockTaskFindOne,
      findAndCountAll: mockTaskFindAndCountAll,
      update: mockTaskUpdate, // Mock phương thức static (nếu có dùng)
      destroy: mockTaskDestroy, // Mock phương thức static (nếu có dùng)
      getAttributes: jest.fn().mockReturnValue({
        // Mock nếu service có dùng getAttributes
        id: {},
        title: {},
        description: {} /* ... các thuộc tính khác ...*/,
        createdAt: {}, // Thêm createdAt nếu logic filter dùng
      }),
      // Giả lập instance trả về từ findByPk/findOne có các phương thức cần thiết
      build: (data: any) => ({
        // Giả lập build để tạo instance nếu cần
        ...data,
        reload: mockInstanceReload,
        update: mockInstanceUpdate,
        destroy: mockInstanceDestroy,
      }),
    },
    // Mock các model khác nếu TaskService có tương tác trực tiếp (ít khả năng)
    User: {},
    Device: {},
    MaintenanceRecord: {},
    InspectionRecord: {},
  },
}));

// Mock các service khác nếu TaskService gọi chúng (hiện tại service không gọi trực tiếp)
// jest.mock('../devices/deviceService');

// --- Import Service Under Test (SAU KHI MOCK) ---
import { taskService } from "./taskService"; // Import service cần test

// --- Test Suite ---

describe("TaskService", () => {
  // Clear tất cả mocks trước mỗi test case để đảm bảo độc lập
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Tests for createTask ---
  describe("createTask", () => {
    it("should create a task successfully and return the reloaded task", async () => {
      // Arrange
      const inputData: TaskCreationAttributes = {
        title: "Test Task",
        taskType: "GENERAL",
        requesterUserId: 1,
        status: "PENDING", // status được cung cấp hoặc dùng default
      };
      const mockCreatedTask = {
        id: 1,
        ...inputData,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Quan trọng: instance trả về phải có hàm reload đã mock
        reload: mockInstanceReload,
      };
      // Giả lập Task.create trả về task đã tạo
      mockTaskCreate.mockResolvedValue(mockCreatedTask);

      // Act
      const result = await taskService.createTask(inputData);

      // Assert
      expect(mockTaskCreate).toHaveBeenCalledTimes(1);
      expect(mockTaskCreate).toHaveBeenCalledWith(inputData); // Kiểm tra data truyền vào create
      expect(mockInstanceReload).toHaveBeenCalledTimes(1); // Kiểm tra reload được gọi
      // Kiểm tra kết quả trả về (sau khi reload)
      // Do reload trả về chính nó (mockCreatedTask), nên kết quả phải là mockCreatedTask
      expect(result).toBe(mockCreatedTask);
      // Hoặc kiểm tra các thuộc tính cụ thể nếu cần
      expect(result.title).toBe(inputData.title);
    });
  });

  // --- Tests for getTaskById ---
  describe("getTaskById", () => {
    it("should return a task with includes if found", async () => {
      // Arrange
      const taskId = 1;
      const mockTask = {
        id: taskId,
        title: "Found Task",
        requesterUserId: 1,
        // ... các trường khác
        reload: mockInstanceReload, // Cần thiết nếu hàm khác gọi reload
        update: mockInstanceUpdate,
        destroy: mockInstanceDestroy,
      };
      // Giả lập findByPk trả về task
      mockTaskFindByPk.mockResolvedValue(mockTask);

      // Act
      const result = await taskService.getTaskById(taskId);

      // Assert
      expect(mockTaskFindByPk).toHaveBeenCalledTimes(1);
      // Kiểm tra gọi với ID đúng và có options (include)
      expect(mockTaskFindByPk).toHaveBeenCalledWith(
        taskId,
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({ as: "requester" }),
            expect.objectContaining({ as: "assignee" }),
            expect.objectContaining({ as: "device" }),
            expect.objectContaining({ as: "maintenanceRecord" }),
            expect.objectContaining({ as: "inspectionRecord" }),
          ]),
        })
      );
      expect(result).toEqual(mockTask); // Kết quả trả về đúng task đã mock
    });

    it("should throw ApiError 404 if task is not found", async () => {
      // Arrange
      const taskId = 999;
      mockTaskFindByPk.mockResolvedValue(null); // Giả lập không tìm thấy

      // Act & Assert
      await expect(taskService.getTaskById(taskId)).rejects.toThrow(ApiError);
      await expect(taskService.getTaskById(taskId)).rejects.toHaveProperty(
        "statusCode",
        404
      );
      expect(mockTaskFindByPk).toHaveBeenCalledWith(taskId, expect.any(Object));
    });

    it("should throw ApiError 400 for invalid ID (NaN)", async () => {
      // Arrange
      const invalidId = NaN;

      // Act & Assert
      await expect(taskService.getTaskById(invalidId)).rejects.toThrow(
        ApiError
      );
      await expect(taskService.getTaskById(invalidId)).rejects.toHaveProperty(
        "statusCode",
        400
      );
      await expect(taskService.getTaskById(invalidId)).rejects.toThrow(
        "Invalid Task ID"
      );
      expect(mockTaskFindByPk).not.toHaveBeenCalled(); // Không gọi DB nếu ID không hợp lệ
    });
  });

  describe("updateTask", () => {
    it("should update allowed fields and return reloaded task", async () => {
      // Arrange
      const taskId = 1;
      const updateData = { title: "Updated Title", priority: "HIGH" };
      const mockExistingTask = {
        id: taskId,
        title: "Old Title",
        priority: "MEDIUM", // ... other fields
        reload: mockInstanceReload,
        update: mockInstanceUpdate, // Mock update trên instance
        // ...
      };
      mockTaskFindByPk.mockResolvedValue(mockExistingTask);
      mockInstanceUpdate.mockResolvedValue(undefined); // update thường không trả về gì

      // Act
      const result = await taskService.updateTask(taskId, updateData);

      // Assert
      expect(mockTaskFindByPk).toHaveBeenCalledWith(taskId);
      expect(mockInstanceUpdate).toHaveBeenCalledTimes(1);
      // Chỉ update các trường cho phép
      expect(mockInstanceUpdate).toHaveBeenCalledWith({
        title: "Updated Title",
        priority: "HIGH",
      });
      expect(mockInstanceReload).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockExistingTask); // Vì reload trả về chính nó
    });

    it("should throw 404 if task not found", async () => {
      // Arrange
      const taskId = 999;
      const updateData = { title: "Update non-existent" };
      mockTaskFindByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(taskService.updateTask(taskId, updateData)).rejects.toThrow(
        ApiError
      );
      await expect(
        taskService.updateTask(taskId, updateData)
      ).rejects.toHaveProperty("statusCode", 404);
      expect(mockInstanceUpdate).not.toHaveBeenCalled();
      expect(mockInstanceReload).not.toHaveBeenCalled();
    });

    it("should throw 400 if no valid fields are provided", async () => {
      const taskId = 1;
      // Gửi các trường không được phép update hoặc undefined
      const updateData: Partial<
        Pick<
          TaskAttributes,
          | "title"
          | "description"
          | "priority"
          | "dueDate"
          | "beforeImagePath"
          | "deviceId"
        >
      > = {
        title: "Updated Task Title",
        description: "Updated description here.",
        priority: "URGENT",
        dueDate: new Date("2026-01-15"),
        beforeImagePath: "/new/path/before.png",
        // deviceId: 11 // Ví dụ cập nhật deviceId (nếu được phép)
      };
      const mockExistingTask = {
        id: taskId,
        status: "PENDING",
        assignedUserId: null,
      };
      mockTaskFindByPk.mockResolvedValue(mockExistingTask);

      await expect(taskService.updateTask(taskId, updateData)).rejects.toThrow(
        ApiError
      );
      await expect(
        taskService.updateTask(taskId, updateData)
      ).rejects.toHaveProperty("statusCode", 400);
      await expect(taskService.updateTask(taskId, updateData)).rejects.toThrow(
        "No valid fields provided for update."
      );
    });

    // Thêm test case lỗi update DB...
  });
});
