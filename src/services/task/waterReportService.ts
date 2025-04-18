import {
  Sequelize,
  FindOptions,
  Transaction,
  Op,
  WhereOptions,
} from "sequelize";
import { models, sequelize } from "../../config/database"; // Giả định đường dẫn này đúng
import { ApiError } from "../../utils/ApiError"; // Import ApiError giống cleaningService
import {
  WaterReportTemplateAttributes,
  WaterReportTemplateCreationAttributes,
  WaterReportTemplateInstance,
} from "../../models/tasks/waterReport/waterReportTemplateModel"; // Điều chỉnh đường dẫn nếu cần
import {
  WaterReportTemplateItemAttributes,
  WaterReportTemplateItemCreationAttributes,
  WaterReportTemplateItemInstance,
} from "../../models/tasks/waterReport/waterReportTemplateItemModel"; // Điều chỉnh đường dẫn
import {
  WaterReportTaskAttributes,
  WaterReportTaskCreationAttributes,
  WaterReportTaskInstance,
} from "../../models/tasks/waterReport/waterReportTaskModel"; // Điều chỉnh đường dẫn
import {
  WaterReportTaskItemAttributes,
  WaterReportTaskItemCreationAttributes,
  WaterReportTaskItemInstance,
} from "../../models/tasks/waterReport/waterReportTaskItemModel"; // Điều chỉnh đường dẫn
// Import các model liên quan khác nếu cần include sâu hơn
// import { BoilerInstance } from "../boilers/boilerModel";
// import { UserInstance } from "../userModel";
import { TaskStatusType } from "../../types/taskStatusType"; // Điều chỉnh đường dẫn

// Destructure các model cần dùng từ 'models' giống cleaningService
const {
  WaterReportTemplate,
  WaterReportTemplateItem,
  WaterReportTask,
  WaterReportTaskItem,
  BoilerUser,
  Boiler, // Giả định có trong models
  User, // Giả định có trong models
} = models;

const waterReportService = {
  // 📌 TEMPLATE CRUD

  getAllTemplates: async (): Promise<WaterReportTemplateInstance[]> => {
    return await WaterReportTemplate.findAll({
      include: [
        {
          model: WaterReportTemplateItem,
          as: "items", // Đổi 'locations' thành 'items'
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        {
          model: Boiler, // Include Boiler nếu cần xem nhanh
          as: "boiler",
          attributes: ["id", "name"],
        },
      ],
    });
  },

  getTemplateById: async (id: number): Promise<WaterReportTemplateInstance> => {
    const template = await WaterReportTemplate.findByPk(id, {
      include: [
        { model: WaterReportTemplateItem, as: "items" },
        { model: Boiler, as: "boiler" },
      ],
    });
    if (!template) throw new ApiError(404, "Water report template not found");
    return template;
  },

  // Tạo template và các items của nó
  createTemplate: async (
    data: WaterReportTemplateCreationAttributes & {
      items?: WaterReportTemplateItemCreationAttributes[];
    }
  ): Promise<WaterReportTemplateInstance> => {
    const { name, boilerId, description, items } = data;

    console.log("dữ liệu khởi tạo",data)
    const itemsToCreate =
      items?.map((itemInput) => {
        if (!itemInput.label) {
          throw new ApiError(400, "Template item label is required.");
        }
        // Chỉ lấy các trường hợp lệ
        return {
          label: itemInput.label,
          description: itemInput.description,
          // Các trường khác của WaterReportTemplateItem nếu có
        };
      }) || [];

    // Kiểm tra trùng lặp tên template cho cùng boiler (nếu có constraint)
    // Ví dụ:
    // const existing = await WaterReportTemplate.findOne({ where: { name, boilerId } });
    // if (existing) throw new ApiError(400, `Template with name "${name}" already exists for this boiler.`);

    const transaction = await sequelize.transaction();
    try {
      // Tạo template và các items cùng lúc bằng include
      const template = await WaterReportTemplate.create(
        {
          name,
          boilerId,
          description,
          items: itemsToCreate, // Truyền mảng items vào đây
        } as any, // Dùng 'as any' nếu TypeScript không nhận diện đúng cấu trúc lồng
        {
          include: [
            {
              model: WaterReportTemplateItem,
              as: "items", // Phải khớp với key 'items' ở trên và alias trong association
            },
          ],
          transaction,
        }
      );

      await transaction.commit();
      // Trả về template vừa tạo (đã bao gồm items nhờ include trong create)
      // Query lại để chắc chắn lấy đúng dữ liệu sau commit (an toàn hơn)
      return waterReportService.getTemplateById(template.id);
    } catch (error: any) {
      await transaction.rollback();
      if (error.name === "SequelizeUniqueConstraintError") {
        // Xử lý lỗi unique cụ thể nếu có (ví dụ: unique index trên name + boilerId)
        throw new ApiError(
          400,
          `Creation failed due to unique constraint. Details: ${error.errors
            ?.map((e: any) => e.message)
            .join(", ")}`
        );
      }
      console.error("Error creating water report template:", error);
      throw new ApiError(
        500,
        error.message || "Failed to create water report template."
      );
    }
  },

  // Cập nhật template (chỉ các trường chính, không xử lý items phức tạp ở đây)
  updateTemplate: async (id: number, data: any) => {
    const template = await WaterReportTemplate.findByPk(id);
    if (!template) {
      throw new ApiError(404, 'Water report template not found');
    }

    const { items, boilerId, ...templateData } = data;

    // Prevent updating boilerId here
    if (boilerId !== undefined && boilerId !== template.boilerId) {
      console.warn('Attempted to update boilerId via updateTemplate. Ignoring.');
    }
    const safeTemplateData = { ...templateData };
    if (boilerId !== undefined) {
      safeTemplateData.boilerId = template.boilerId; // Keep the original boilerId
    }

    // Update the template's basic information
    await template.update(safeTemplateData);

    if (items && Array.isArray(items)) {
      const existingItems = await WaterReportTemplateItem.findAll({
        where: { templateId: id },
      });

      const updatedItemIds = new Set<number>();

      // Process each item in the provided array
      for (const itemData of items) {
        if (itemData.id) {
          // Update existing item
          const existingItem = existingItems.find((item) => item.id === itemData.id);
          if (existingItem) {
            await existingItem.update(itemData);
            updatedItemIds.add(itemData.id);
          } else {
            console.warn(`Item with ID ${itemData.id} not found for template ${id}.`);
          }
        } else {
          // Create a new item
          await WaterReportTemplateItem.create({ ...itemData, templateId: id });
        }
      }

      // Remove items that are not in the updated list
      const itemsToRemove = existingItems.filter((item) => !updatedItemIds.has(item.id));

      for (const itemToRemove of itemsToRemove) {
        await itemToRemove.destroy();
      }
    }

    return await template.reload({
      include: [
        { model: WaterReportTemplateItem, as: 'items' },
        { model: Boiler, as: 'boiler' },
      ],
    });
  },

  // Xóa template (sẽ cascade xóa items)
  deleteTemplate: async (id: number): Promise<{ message: string }> => {
    const template = await WaterReportTemplate.findByPk(id);
    if (!template) throw new ApiError(404, "Water report template not found");

    await WaterReportTemplate.destroy({ where: { id } });
    return { message: "Water report template deleted successfully" };
  },

  // 📌 TASK CRUD

  // Lấy các task được gán cho user theo ngày
  getAssignedTasksByDate: async (
    userId: number,
    date: string // Format 'YYYY-MM-DD'
  ): Promise<WaterReportTaskInstance[]> => {
    try {
      return await WaterReportTask.findAll({
        where: {
          assignedTo: userId,
          scheduledDate: date,
        },
        include: [
          {
            model: WaterReportTaskItem, // Đổi từ CleaningTaskLocation
            as: "items", // Đổi từ 'locations'
            attributes: { exclude: ["updatedAt"] },
            include: [
              {
                model: WaterReportTemplateItem, // Đổi từ CleaningTemplateLocation
                as: "templateItem", // Đổi từ 'templateLocation'
                attributes: ["id", "label", "description"], // Lấy các trường cần thiết của item template
              },
            ],
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "fullName", "email"],
          },
          {
            model: User,
            as: "assignee",
            attributes: ["id", "fullName", "email"],
          }, // Là chính user truy vấn
          {
            model: Boiler,
            as: "boiler",
            attributes: ["id", "name", "location"],
          },
          {
            model: WaterReportTemplate,
            as: "template",
            attributes: ["id", "name"],
          },
        ],
        order: [
          ["scheduledDate", "ASC"],
          ["createdAt", "ASC"],
        ], // Sắp xếp theo ngày, rồi theo thời gian tạo
      });
    } catch (error: any) {
      console.error(
        `Error fetching assigned water report tasks for user ${userId} on date ${date}:`,
        error
      );
      throw new ApiError(
        500,
        error.message || "Failed to fetch assigned water report tasks."
      );
    }
  },

  // Lấy task theo boiler và ngày
  getTasksByDate: async (
    boilerId: number,
    scheduledDate: string // Format 'YYYY-MM-DD'
  ): Promise<WaterReportTaskInstance[]> => {
    return await WaterReportTask.findAll({
      where: { boilerId, scheduledDate },
      include: [
        {
          model: WaterReportTaskItem,
          as: "items",
          attributes: { exclude: ["updatedAt"] },
          include: [
            {
              model: WaterReportTemplateItem,
              as: "templateItem",
              attributes: ["id", "label", "description"],
            },
          ],
        },
        { model: User, as: "creator", attributes: ["id", "fullName", "email"] },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: WaterReportTemplate,
          as: "template",
          attributes: ["id", "name"],
        },
        // Không cần include Boiler vì đã lọc theo boilerId rồi, nhưng có thể thêm nếu muốn
        { model: Boiler, as: "boiler", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "ASC"]],
    });
  },
  getTaskById: async (
    taskId: number,
    includeDetails: boolean = true
  ): Promise<WaterReportTaskInstance> => {
    let includeOptions: any[] = [];
    if (includeDetails) {
      includeOptions = [
        { model: Boiler, as: "boiler" },
        { model: User, as: "assignee" },
        { model: User, as: "creator" },
        { model: WaterReportTemplate, as: "template" },
        {
          model: WaterReportTaskItem,
          as: "items", // Alias cho association với WaterReportTaskItem
          include: [
            {
              model: WaterReportTemplateItem,
              as: "templateItem", // Alias cho association lồng với WaterReportTemplateItem
            },
          ],
        },
      ];
    }

    const task = await WaterReportTask.findByPk(taskId, {
      include: includeOptions,
    });

    // Ném lỗi nếu không tìm thấy task
    if (!task) {
      throw new ApiError(404, `Water report task with ID ${taskId} not found.`);
    }
    return task;
  },
  // Lấy các task còn trống (chưa assign) cho các lò hơi mà user quản lý
  getAvailableTasksForMyBoilers: async (
    userId: number,
    date: string // Format 'YYYY-MM-DD'
  ): Promise<WaterReportTaskInstance[]> => {
    try {
      // 1. Tìm boilerIds của user
      const userBoilers = await BoilerUser.findAll({
        where: { userId: userId },
        attributes: ["boilerId"],
        raw: true,
      });
      const boilerIds = userBoilers.map(
        (ub: { boilerId: number }) => ub.boilerId
      );
      console.log(boilerIds)
      if (boilerIds.length === 0) {
        console.log(`User ${userId} is not associated with any boilers.`);
        return [];
      }

      // 2. Tìm WaterReportTask thỏa mãn
      const availableTasks = await WaterReportTask.findAll({
        where: {
          boilerId: { [Op.in]: boilerIds },
          scheduledDate: date,
          assignedTo: null, // Chưa được gán
          status: "pending", // Chỉ lấy task chưa bắt đầu
        },
        include: [
          // Include đầy đủ thông tin cần thiết
          {
            model: WaterReportTaskItem,
            as: "items",
            attributes: { exclude: ["updatedAt"] },
            include: [
              {
                model: WaterReportTemplateItem,
                as: "templateItem",
                attributes: ["id", "label", "description"],
              },
            ],
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "fullName", "email"],
          },
          {
            model: Boiler,
            as: "boiler",
            attributes: ["id", "name", "location"],
          },
          {
            model: WaterReportTemplate,
            as: "template",
            attributes: ["id", "name"],
          },
          // Không cần include assignee vì đang là NULL
        ],
        order: [["createdAt", "ASC"]],
      });
      console.log(
        `Found ${availableTasks.length} available water report tasks for user ${userId} on ${date}.`
      );
      return availableTasks;
    } catch (error: any) {
      console.error(
        `Error fetching available water report tasks for user ${userId} on date ${date}:`,
        error
      );
      throw new ApiError(
        500,
        error.message || "Failed to fetch available water report tasks."
      );
    }
  },

  // Tạo task mới dựa trên template
  createTask: async (
    data: WaterReportTaskCreationAttributes
  ): Promise<WaterReportTaskInstance> => {
    const { boilerId, createdBy, templateId, scheduledDate, assignedTo } = data;

    if (!templateId) {
      throw new ApiError(
        400,
        "templateId is required to create a water report task."
      );
    }

    // Tìm template và các items của nó
    const template = await WaterReportTemplate.findByPk(templateId, {
      include: [
        { model: WaterReportTemplateItem, as: "items", required: true },
      ], // required: true để đảm bảo template có items
    });

    if (!template || !template.items || template.items.length === 0) {
      throw new ApiError(
        404,
        `Water report template with ID ${templateId} not found or has no items defined.`
      );
    }

    const transaction = await sequelize.transaction();
    try {
      // 1. Tạo Task chính
      const task = await WaterReportTask.create(
        {
          boilerId,
          templateId,
          scheduledDate, // Đảm bảo là 'YYYY-MM-DD'
          createdBy,
          assignedTo,
          status: "pending", // Trạng thái mặc định khi tạo
        },
        { transaction }
      );

      // 2. Tạo các Task Items tương ứng
      const taskItemsToCreate = template.items.map((templateItem) => ({
        taskId: task.id,
        templateItemId: templateItem.id,
        // Các trường khác của WaterReportTaskItem có thể có giá trị mặc định là null
      }));

      if (taskItemsToCreate.length > 0) {
        await WaterReportTaskItem.bulkCreate(taskItemsToCreate, {
          transaction,
        });
      }

      await transaction.commit();

      // Lấy lại task vừa tạo với đầy đủ thông tin
      return waterReportService.getTaskById(task.id, true);
    } catch (error: any) {
      await transaction.rollback();
      console.error("Error creating water report task:", error);
      throw new ApiError(
        500,
        error.message || "Failed to create water report task."
      );
    }
  },

  // Cập nhật trạng thái task (ví dụ: admin hủy task)
  updateTaskStatus: async (
    taskId: number,
    status: TaskStatusType
  ): Promise<WaterReportTaskInstance> => {
    const task = await WaterReportTask.findByPk(taskId);
    if (!task) throw new ApiError(404, "Water report task not found");

    // Logic kiểm tra thêm nếu cần, ví dụ không cho set completed thủ công
    if (
      status === "completed" &&
      task.status !== "completed" /* && !isAdmin */
    ) {
      // Có thể ném lỗi hoặc chỉ cảnh báo, vì hàm completeTaskItem sẽ xử lý việc set completed
      console.warn(
        `Manually setting status to 'completed' for task ${taskId}. This is usually handled by completing all items.`
      );
    }

    const updateData: Partial<WaterReportTaskAttributes> & {
      completedAt?: Date | null;
    } = { status };

    // Chỉ cập nhật completedAt nếu chuyển sang 'completed'
    if (status === "completed" && task.status !== "completed") {
      updateData.completedAt = new Date();
    } else if (status !== "completed" && task.status === "completed") {
      // Reset completedAt nếu chuyển từ 'completed' sang trạng thái khác
      updateData.completedAt = null;
    }

    await task.update(updateData);
    // Reload để lấy trạng thái mới nhất và các relations
    return task.reload({
      include: [
        { model: Boiler, as: "boiler" },
        { model: User, as: "assignee" },
        { model: WaterReportTaskItem, as: "items" }, // Include items để thấy trạng thái tổng thể
      ],
    });
  },

  // User nhận (claim) một task có sẵn
  acceptTask: async (
    userId: number,
    taskId: number
  ): Promise<WaterReportTaskInstance> => {
    const transaction = await sequelize.transaction();
    try {
      // Tìm task chưa được assign và đang pending
      const task = await WaterReportTask.findOne({
        where: {
          id: taskId,
          assignedTo: null, // Chưa ai nhận
          status: "pending", // Đang chờ
        },
        transaction, // Lock task để tránh race condition (tùy mức độ cần thiết)
      });

      if (!task) {
        // Kiểm tra xem task có tồn tại nhưng đã được nhận hoặc không pending không
        const existingTask = await WaterReportTask.findByPk(taskId, {
          attributes: ["id", "assignedTo", "status"],
          transaction,
        });
        if (!existingTask) throw new ApiError(404, "Task not found.");
        if (existingTask.assignedTo)
          throw new ApiError(400, "Task has already been assigned.");
        if (existingTask.status !== "pending")
          throw new ApiError(
            400,
            `Task is not pending (status: ${existingTask.status}).`
          );
        // Nếu không rơi vào các trường hợp trên thì là lỗi không xác định
        throw new ApiError(500, "Could not accept the task.");
      }

      // Gán task cho user và chuyển trạng thái
      await task.update(
        {
          assignedTo: userId,
          status: "in_process",
        },
        { transaction }
      );

      await transaction.commit();

      // Reload để lấy thông tin user assignee
      return task.reload({ include: [{ model: User, as: "assignee" }] });
    } catch (error: any) {
      await transaction.rollback();
      console.error(
        `Error accepting task ${taskId} for user ${userId}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, error.message || "Failed to accept the task.");
    }
  },

  // Hoàn thành một item trong task (nhập kết quả)
  completeTaskItem: async (
    taskItemId: number,
    itemData: {
      imageUrl?: string | null;
      valueFromAI?: string | null;
      isQualify?: boolean | null;
      notes?: string | null;
    },
    // Có thể thêm userId người hoàn thành nếu cần log
    completedByUserId?: number
  ): Promise<WaterReportTaskItemInstance> => {
    const transaction = await sequelize.transaction();
    try {
      // 1. Tìm và cập nhật WaterReportTaskItem
      const taskItem = await WaterReportTaskItem.findByPk(taskItemId, {
        transaction,
        // Include cả task cha để lấy taskId và kiểm tra trạng thái
        include: [
          {
            model: WaterReportTask,
            as: "task",
            attributes: ["id", "status", "completedAt"],
          },
        ],
      });
      if (!taskItem) {
        throw new ApiError(
          404,
          `Water report task item with ID ${taskItemId} not found.`
        );
      }
      if (!taskItem.task) {
        // Lỗi dữ liệu nếu không tìm thấy task cha
        throw new ApiError(
          500,
          `Could not find parent task for item ${taskItemId}.`
        );
      }

      // --- Logic kiểm tra xem item đã "hoàn thành" chưa ---
      // Giả định: Item được coi là đã xử lý/hoàn thành nếu isQualify không còn là null.
      // Bạn có thể thay đổi logic này tùy theo yêu cầu (ví dụ: phải có ảnh HOẶC isQualify)
      const wasAlreadyCompleted = taskItem.isQualify !== null; // Kiểm tra trạng thái trước khi update

      if (wasAlreadyCompleted) {
        console.warn(
          `Task item ${taskItemId} already has isQualify set. Updating values anyway.`
        );
        // Quyết định: cho phép cập nhật lại giá trị hay không? Nếu không thì throw error ở đây.
        // throw new ApiError(400, `Task item ${taskItemId} was already completed.`);
      }

      // Cập nhật các trường kết quả
      await taskItem.update(
        {
          imageUrl: itemData.imageUrl,
          valueFromAI: itemData.valueFromAI,
          isQualify: itemData.isQualify,
          notes: itemData.notes,
          // KHÔNG có completedAt trên item model, dùng isQualify để check
        },
        { transaction }
      );

      // 2. Kiểm tra và cập nhật trạng thái Task cha
      const taskId = taskItem.taskId;
      // Lấy lại task cha và TẤT CẢ các items của nó để kiểm tra hoàn thành
      const parentTask = await WaterReportTask.findByPk(taskId, {
        include: [
          {
            model: WaterReportTaskItem,
            as: "items",
            // Chỉ cần các trường để xác định item đã hoàn thành chưa
            attributes: [
              "id",
              "isQualify" /* có thể thêm các trường khác nếu logic phức tạp hơn */,
            ],
          },
        ],
        transaction,
      });

      if (!parentTask || !parentTask.items) {
        // Lỗi này không nên xảy ra nếu taskItem ở trên tìm thấy task cha
        console.error(
          `Parent task ${taskId} not found or has no items after updating item ${taskItemId}.`
        );
        throw new ApiError(
          500,
          `Could not find parent task or its items for task ID ${taskId}.`
        );
      }

      const totalItems = parentTask.items.length;
      // Đếm số item đã "hoàn thành" (theo logic isQualify != null)
      const completedItemsCount = parentTask.items.filter(
        (item) => item.isQualify !== null
      ).length;

      let newParentStatus = parentTask.status;
      let parentCompletedAt: Date | null = parentTask.completedAt ?? null; // Giữ giá trị cũ nếu có

      if (completedItemsCount === totalItems) {
        // Nếu tất cả items đã hoàn thành
        if (parentTask.status !== "completed") {
          // Chỉ cập nhật nếu chưa completed
          newParentStatus = "completed";
          parentCompletedAt = parentCompletedAt || new Date(); // Set completedAt nếu chưa có
        }
      } else if (completedItemsCount > 0 && parentTask.status === "pending") {
        // Nếu có item hoàn thành và task đang pending -> chuyển sang in_process
        newParentStatus = "in_process";
      }
      // Nếu completedItemsCount = 0 hoặc task đã là in_process/completed thì giữ nguyên status (trừ khi tất cả hoàn thành)

      // Chỉ update task cha nếu trạng thái hoặc completedAt thay đổi
      const hasStatusChanged = newParentStatus !== parentTask.status;
      const hasCompletedAtChanged =
        parentCompletedAt?.getTime() !== parentTask.completedAt?.getTime();

      if (hasStatusChanged || hasCompletedAtChanged) {
        await parentTask.update(
          {
            status: newParentStatus,
            completedAt: parentCompletedAt,
          },
          { transaction }
        );
      }

      await transaction.commit();

      // Trả về item vừa được cập nhật (reload để lấy templateItem info nếu cần)
      return await taskItem.reload({
        include: [{ model: WaterReportTemplateItem, as: "templateItem" }],
      });
    } catch (error: any) {
      await transaction.rollback();
      console.error(
        `Error completing water report task item ${taskItemId}:`,
        error
      );
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        500,
        error.message || `Failed to complete task item ${taskItemId}.`
      );
    }
  },
}; // Kết thúc object waterReportService

export default waterReportService;
