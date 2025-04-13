import { models, sequelize } from "../../config/database"; // Thêm sequelize để dùng transaction
import {
  CleaningTemplateAttributes, // Có thể cần cập nhật interface này nếu chưa có locations
  CleaningTemplateInstance,
} from "../../models/tasks/cleaning/cleaningTemplateModel";
import { ApiError } from "../../utils/ApiError";
import { v4 as uuidv4 } from "uuid"; // Thư viện để tạo ID duy nhất (nếu cần)
import { CleaningTaskLocationInstance } from "../../models/tasks/cleaning/cleaningTaskLocationModel";
import { CleaningTaskInstance } from "../../models/tasks/cleaning/cleaningTaskModel";
import { CleaningTaskCreationAttributes } from "../../models/tasks/cleaning/cleaningTaskModel"; // Đảm bảo import kiểu này
import { Op } from "sequelize";
import { TaskStatusType } from "../../types/taskStatusType";
type CleaningTaskLocation = CleaningTaskLocationInstance;
type CleaningTask = CleaningTaskInstance;
const {
  CleaningTemplate,
  CleaningTemplateLocation,
  CleaningTask,
  CleaningTaskLocation,
  BoilerUser,
  User,
  Boiler,
  // Thêm các model khác nếu cần include sâu hơn
} = models;

interface LocationInput {
  name: string; // Tên vị trí là bắt buộc khi tạo
  qrCodeIdentifier?: string; // Mã QR có thể có hoặc không từ client (sẽ tự tạo nếu thiếu)
  instructions?: string | null;
  exampleImageUrl?: string | null;
  // Thêm các trường khác bạn muốn cho phép client gửi khi tạo location ở đây
}


interface CreateCleaningTemplateInputUpdated
  extends Omit<CleaningTemplateAttributes, "id"> {
  locations?: LocationInput[]; // Sử dụng interface đã sửa
}


const cleaningService = {
  // 📌 TEMPLATE CRUD

  getAllTemplates: async () => {
    return await CleaningTemplate.findAll({
      include: [
        {
          model: CleaningTemplateLocation,
          as: "locations",
          attributes: { exclude: ["createdAt", "updatedAt"] }, // Loại trừ các trường không cần thiết nếu muốn
        },
      ],
    });
  },

  getTemplateById: async (id: number) => {
    const template = await CleaningTemplate.findByPk(id, {
      include: [{ model: CleaningTemplateLocation, as: "locations" }],
    });
    if (!template) throw new ApiError(404, "Cleaning template not found");
    return template;
  },

  // --- SỬA ĐỔI createTemplate ---
  createTemplate: async (
    data: CreateCleaningTemplateInputUpdated
  ): Promise<CleaningTemplateInstance> => {
    const { name, boilerId, description, locations } = data;

    // Chuẩn bị dữ liệu locations, đảm bảo có qrCodeIdentifier
    const locationsToCreate =
      locations?.map((locInput) => {
        // Đổi tên biến để rõ ràng hơn
        // Validate input cơ bản
        if (!locInput.name) {
          throw new ApiError(400, "Location name is required.");
        }
        // Nếu client không gửi qrCodeIdentifier, tạo tự động
        const qrIdentifier = locInput.qrCodeIdentifier || uuidv4();

        // Chỉ lấy các trường hợp lệ để tạo CleaningTemplateLocation
        return {
          name: locInput.name,
          qrCodeIdentifier: qrIdentifier,
          instructions: locInput.instructions,
          exampleImageUrl: locInput.exampleImageUrl,
          // Đảm bảo các trường này khớp với CleaningTemplateLocationAttributes (trừ id, templateId)
        };
      }) || [];

    // --- Phần còn lại của hàm createTemplate giữ nguyên ---
    // Kiểm tra sự trùng lặp qrCodeIdentifier trong cùng request
    const qrIdentifiers = locationsToCreate.map((l) => l.qrCodeIdentifier);
    if (new Set(qrIdentifiers).size !== qrIdentifiers.length) {
      throw new ApiError(
        400,
        "Duplicate qrCodeIdentifier found in the provided locations."
      );
    }

    // Kiểm tra sự trùng lặp qrCodeIdentifier với DB
    if (qrIdentifiers.length > 0) {
      const existingLocations = await CleaningTemplateLocation.findAll({
        where: { qrCodeIdentifier: qrIdentifiers },
      });
      if (existingLocations.length > 0) {
        throw new ApiError(
          400,
          `qrCodeIdentifier(s) already exist: ${existingLocations
            .map((l) => l.qrCodeIdentifier)
            .join(", ")}`
        );
      }
    }

    // Sử dụng transaction để đảm bảo tính toàn vẹn
    const transaction = await sequelize.transaction();
    try {
      const template = await CleaningTemplate.create(
        {
          name,
          boilerId,
          description,
          locations: locationsToCreate,
        } as any,
        {
          include: [
            {
              model: CleaningTemplateLocation,
              as: "locations", // Phải khớp với key 'locations' ở trên và association alias
            },
          ],
          transaction,
        }
      );

      await transaction.commit();
      return template;
    } catch (error: any) {
      // ... (phần xử lý lỗi giữ nguyên)
      await transaction.rollback();
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new ApiError(
          400,
          `Creation failed due to unique constraint violation. Check qrCodeIdentifier. Details: ${error.errors
            ?.map((e: any) => e.message)
            .join(", ")}`
        );
      }
      console.error("Error creating cleaning template:", error);
      throw new ApiError(
        500,
        error.message || "Failed to create cleaning template."
      );
    }
  },
  // updateTemplate cần xem xét: việc cập nhật locations (thêm/sửa/xóa) và qrCodeIdentifier phức tạp hơn,
  // có thể cần logic riêng để xử lý thay vì chỉ template.update(data). Tạm thời giữ nguyên.
  updateTemplate: async (id: number, data: any) => {
    // TODO: Cần xử lý cập nhật locations phức tạp hơn nếu cho phép sửa đổi locations
    // Ví dụ: Tìm locations cũ, locations mới, xóa cái cũ không có trong mới, thêm cái mới, cập nhật cái trùng...
    // Đặc biệt cẩn thận khi cập nhật qrCodeIdentifier.
    const template = await CleaningTemplate.findByPk(id);
    if (!template) throw new ApiError(404, "Cleaning template not found");

    // Chỉ cập nhật các trường của chính Template (name, description)
    const { locations, ...templateData } = data; // Loại bỏ locations khỏi data update trực tiếp
    await template.update(templateData);
    // Logic xử lý locations riêng biệt (nếu cần) sẽ ở đây

    return await template.reload({
      // Tải lại để lấy dữ liệu mới nhất (bao gồm locations nếu có thay đổi)
      include: [{ model: CleaningTemplateLocation, as: "locations" }],
    });
  },

  deleteTemplate: async (id: number) => {
    // Transaction không thực sự cần thiết cho delete đơn giản này
    // vì onDelete: 'CASCADE' ở association sẽ tự động xóa locations
    const template = await CleaningTemplate.findByPk(id);
    if (!template) throw new ApiError(404, "Cleaning template not found");

    const deleted = await CleaningTemplate.destroy({ where: { id } });
    // Không cần kiểm tra deleted > 0 vì đã kiểm tra sự tồn tại ở trên
    return { message: "Deleted successfully" };
  },

  // 📌 TASK CRUD
  getCleaningTaskById: async (id: number): Promise<CleaningTaskInstance> => {
    const task = await CleaningTask.findByPk(id, {
      include: [
        {
          model: CleaningTaskLocation,
          as: "locations",
          attributes: { exclude: ["updatedAt"] },
          include: [
            {
              model: CleaningTemplateLocation,
              as: "templateLocation",
              attributes: [
                "id",
                "name",
                "qrCodeIdentifier",
                "instructions",
                "exampleImageUrl",
              ],
            },
          ],
        },
        {
          model: models.User,
          as: "creator",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: models.User,
          as: "assignedUser",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: models.Boiler,
          as: "boiler",
          attributes: ["id", "name", "location"],
        },
        {
          model: models.CleaningTemplate,
          as: "template",
          attributes: ["id", "name"],
        },
      ],
    });
  
    if (!task) {
      throw new ApiError(404, "Cleaning task not found");
    }
  
    return task;
  },
  getAssignedTasksByDate: async (
    userId: number,
    date: string
  ): Promise<CleaningTaskInstance[]> => {
    try {
      return await CleaningTask.findAll({
        where: {
          assignedTo: userId, // Lọc theo ID người dùng được giao
          scheduledDate: date, // Lọc theo ngày
        },
        include: [
          // Include các associations tương tự như getTasksByDate để có đủ thông tin
          {
            model: CleaningTaskLocation,
            as: "locations",
            attributes: { exclude: ["updatedAt"] },
            include: [
              {
                model: CleaningTemplateLocation,
                as: "templateLocation",
                attributes: [
                  "id",
                  "name",
                  "qrCodeIdentifier",
                  "instructions",
                  "exampleImageUrl",
                ],
              },
            ],
          },
          {
            model: models.User, // Người tạo task
            as: "creator",
            attributes: ["id", "fullName", "email"],
          },
          {
            model: models.User, // Người được giao (là chính user đang truy vấn)
            as: "assignedUser",
            attributes: ["id", "fullName", "email"],
          },
          {
            model: models.Boiler, // Include thông tin Boiler nếu cần
            as: "boiler",
            attributes: ["id", "name", "location"], // Chọn các trường cần thiết của Boiler
          },
          {
            model: models.CleaningTemplate, // Include thông tin Template nếu cần
            as: "template",
            attributes: ["id", "name"],
          },
        ],
        order: [
          ["scheduledDate", "ASC"],
          ["id", "ASC"],
        ], // Sắp xếp kết quả
      });
    } catch (error: any) {
      console.error(
        `Error fetching assigned tasks for user ${userId} on date ${date}:`,
        error
      );
      // Ném lỗi để controller bắt hoặc trả về mảng rỗng tùy logic mong muốn
      throw new ApiError(
        500,
        error.message || "Failed to fetch assigned cleaning tasks."
      );
    }
  },
  // --- SỬA ĐỔI getTasksByDate ---
  getTasksByDate: async (boilerId: number, scheduledDate: string) => {
    return await CleaningTask.findAll({
      where: { boilerId, scheduledDate },
      include: [
        {
          model: CleaningTaskLocation,
          as: "locations",
          attributes: { exclude: ["updatedAt"] }, // Chọn các trường cần thiết
          include: [
            // Include lồng để lấy thông tin từ Template Location
            {
              model: CleaningTemplateLocation,
              as: "templateLocation", // Phải khớp với alias trong associate của CleaningTaskLocation
              attributes: [
                "id",
                "name",
                "qrCodeIdentifier",
                "instructions",
                "exampleImageUrl",
              ], // Lấy các trường cần hiển thị
            },
          ],
        },
        {
          model: models.User, // Ví dụ include người tạo hoặc người được assign
          as: "creator",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: models.User,
          as: "assignedUser",
          attributes: ["id", "fullName", "email"],
        },
        // Include thêm Boiler nếu cần
      ],
      order: [
        ["scheduledDate", "ASC"],
        ["id", "ASC"],
      ], // Sắp xếp kết quả
    });
  },
  getAvailableTasksForMyBoilers: async (
    userId: number,
    date: string
  ): Promise<CleaningTaskInstance[]> => {
    try {
      // 1. Tìm các boilerId mà user này được phép làm việc
      const userBoilers = await BoilerUser.findAll({
        where: { userId: userId },
        attributes: ["boilerId"], // Chỉ lấy boilerId
        raw: true, // Lấy kết quả dạng object đơn giản
      });

      const boilerIds = userBoilers.map(
        (ub: { boilerId: number }) => ub.boilerId
      );

      // Nếu user không thuộc lò nào, trả về mảng rỗng
      if (boilerIds.length === 0) {
        console.log(`User ${userId} is not associated with any boilers.`);
        return [];
      }

      console.log(
        `User ${userId} belongs to boilers: ${boilerIds.join(
          ", "
        )}. Fetching available tasks for date ${date}.`
      );

      // 2. Tìm các CleaningTask thỏa mãn điều kiện
      const availableTasks = await CleaningTask.findAll({
        where: {
          boilerId: { [Op.in]: boilerIds }, // Thuộc các lò của user
          scheduledDate: date, // Đúng ngày
          assignedTo: null, // Chưa được ai nhận (claim)
          status: "pending", // Chỉ lấy task chưa bắt đầu
        },
        include: [
          // Include đầy đủ thông tin như các hàm get khác
          {
            model: CleaningTaskLocation,
            as: "locations",
            attributes: { exclude: ["updatedAt"] },
            include: [
              {
                model: CleaningTemplateLocation,
                as: "templateLocation",
                attributes: [
                  "id",
                  "name",
                  "qrCodeIdentifier",
                  "instructions",
                  "exampleImageUrl",
                ],
              },
            ],
          },
          {
            model: User, // Người tạo task
            as: "creator",
            attributes: ["id", "fullName", "email"],
          },
          {
            model: Boiler, // Thông tin Boiler
            as: "boiler",
            attributes: ["id", "name", "location"],
          },
          {
            model: CleaningTemplate, // Thông tin Template
            as: "template",
            attributes: ["id", "name"],
          },
          // Không cần include assignedUser vì nó đang là NULL
        ],
        order: [
          ["scheduledDate", "ASC"],
          ["id", "ASC"],
        ],
      });
      console.log(
        `Found ${availableTasks.length} available tasks for user ${userId} on ${date}.`
      );
      return availableTasks;
    } catch (error: any) {
      console.error(
        `Error fetching available tasks for user ${userId} on date ${date}:`,
        error
      );
      throw new ApiError(
        500,
        error.message || "Failed to fetch available cleaning tasks."
      );
    }
  },
  // --- SỬA ĐỔI createTask ---
  createTask: async (data: any) => {
    const { boilerId, createdBy, templateId, scheduledDate, assignedTo } = data;

    if (!templateId) {
      throw new ApiError(
        400,
        "templateId is required to create a cleaning task."
      );
    }

    const template = await CleaningTemplate.findByPk(templateId, {
      include: [
        { model: CleaningTemplateLocation, as: "locations", required: true },
      ],
    });

    if (!template || !template.locations || template.locations.length === 0) {
      throw new ApiError(
        404,
        `Cleaning template with ID ${templateId} not found or has no locations defined.`
      );
    }

    const transaction = await sequelize.transaction();
    try {
      // KHÔNG CẦN 'as any' nữa nếu đã sửa model đúng cách
      const task = await CleaningTask.create(
        {
          boilerId,
          templateId,
          scheduledDate, // Đảm bảo giá trị là 'YYYY-MM-DD' string
          createdBy,
          assignedTo,
        },
        { transaction }
      );

      const taskLocationsToCreate = template.locations.map((templateLoc) => ({
        taskId: task.id,
        templateLocationId: templateLoc.id,
      }));

      if (taskLocationsToCreate.length > 0) {
        await CleaningTaskLocation.bulkCreate(taskLocationsToCreate, {
          transaction,
        });
      }

      await transaction.commit();

      const createdTaskWithLocations = await CleaningTask.findByPk(task.id, {
        include: [
          /* ... includes như trước ... */
        ],
      });
      return createdTaskWithLocations;
    } catch (error: any) {
      // ... (xử lý lỗi)
      await transaction.rollback();
      console.error("Error creating cleaning task:", error);
      throw new ApiError(
        500,
        error.message || "Failed to create cleaning task."
      );
    }
  },
  updateTaskStatus: async (taskId: number, status: TaskStatusType) => {
    // Logic này có thể cần xem xét lại. Chỉ nên cho phép cập nhật trạng thái tổng
    // nếu không phải là 'completed' (trạng thái completed nên được set tự động
    // khi tất cả locations hoàn thành trong hàm completeTaskLocation mới)
    // Hoặc có thể dùng để admin override trạng thái.
    const task = await CleaningTask.findByPk(taskId);
    if (!task) throw new ApiError(404, "Cleaning task not found");

    // Có thể thêm kiểm tra logic ở đây, ví dụ: không cho set completed thủ công
    if (status === "completed" /* && !isAdmin */) {
      // throw new ApiError(400, "Task status 'completed' is set automatically when all locations are done.");
    }

    await task.update({ status });
    return await task.reload({
      // reload để lấy data mới nhất và associations nếu cần
      include: [
        {
          model: CleaningTaskLocation,
          as: "locations",
          include: [
            {
              model: CleaningTemplateLocation,
              as: "templateLocation",
              attributes: ["id", "name", "qrCodeIdentifier"],
            },
          ],
        },
      ],
    });
  },
  acceptTask: async (userId: number, taskId: number) => {
    // Lấy task từ DB
    const task = await CleaningTask.findOne({
      where: { id: taskId, assignedTo: null }, // Kiểm tra task chưa được nhận
    });

    if (!task) {
      throw new ApiError(404, "Task not found or already accepted.");
    }

    // Cập nhật trạng thái task và giao cho user
    task.status = "in_process"; // Hoặc bạn có thể dùng giá trị khác cho "đang làm"
    task.assignedTo = userId;
    await task.save();

    return task;
  },
  // --- THÊM SERVICE FUNCTION MỚI ---
  completeTaskLocation: async (
    locationId: number,
    photoUrl: string,
    notes?: string | null,
    completedByUserId?: number
  ): Promise<CleaningTaskLocation> => {
    const transaction = await sequelize.transaction();
    try {
      // 1. Tìm và cập nhật CleaningTaskLocation
      const taskLocation = await CleaningTaskLocation.findByPk(locationId, {
        transaction,
      });
      if (!taskLocation) {
        throw new ApiError(
          404,
          `Cleaning task location with ID ${locationId} not found.`
        );
      }

      // Kiểm tra xem đã hoàn thành chưa
      if (taskLocation.completedAt) {
        console.warn(
          `Task location ${locationId} already completed at ${taskLocation.completedAt}. Skipping update.`
        );
        await transaction.commit();
        return taskLocation;
      }

      await taskLocation.update(
        {
          photoUrl,
          notes,
          completedAt: new Date(),
        },
        { transaction }
      );

      // 2. Kiểm tra và cập nhật trạng thái CleaningTask cha
      const taskId = taskLocation.taskId;
      const parentTask = await CleaningTask.findByPk(taskId, {
        include: [
          {
            model: CleaningTaskLocation,
            as: "locations",
            attributes: ["id", "completedAt"],
          },
        ],
        transaction,
      });

      if (!parentTask || !parentTask.locations) {
        console.error(
          `Parent task with ID ${taskId} not found or has no locations after updating location ${locationId}.`
        );
        throw new ApiError(
          500,
          `Could not find parent task or its locations for task ID ${taskId}.`
        );
      }

      const totalLocations = parentTask.locations.length;
      const completedLocations = parentTask.locations.filter(
        (loc) => loc.completedAt !== null
      ).length;

      let newParentStatus = parentTask.status;
      // --- SỬA DÒNG NÀY ---
      // Sử dụng ?? để gán null nếu parentTask.completedAt là null hoặc undefined
      let parentCompletedAt: Date | null = parentTask.completedAt ?? null;
      // --------------------

      if (completedLocations === totalLocations) {
        newParentStatus = "completed";
        // Gán lại parentCompletedAt, nếu nó đã là Date thì giữ nguyên, nếu là null thì gán new Date()
        parentCompletedAt = parentCompletedAt || new Date();
      } else if (completedLocations > 0 && parentTask.status === "pending") {
        newParentStatus = "in_process";
      }

      const hasStatusChanged = newParentStatus !== parentTask.status;
      const hasCompletedAtChanged =
        parentCompletedAt?.getTime() !== parentTask.completedAt?.getTime();

      if (hasStatusChanged || hasCompletedAtChanged) {
        await parentTask.update(
          {
            status: newParentStatus,
            completedAt: parentCompletedAt, // Truyền giá trị đã xử lý
          },
          { transaction }
        );
      }

      await transaction.commit();

      // Trả về location vừa được cập nhật
      return await taskLocation.reload({
        include: [
          {
            model: CleaningTemplateLocation,
            as: "templateLocation",
            attributes: ["id", "name", "qrCodeIdentifier"],
          },
        ],
      });
    } catch (error: any) {
      // ... (xử lý lỗi)
      await transaction.rollback();
      console.error(`Error completing task location ${locationId}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        500,
        error.message || `Failed to complete task location ${locationId}.`
      );
    }
  },
};

export default cleaningService;
