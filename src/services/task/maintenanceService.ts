import { models, sequelize } from "../../config/database";
import { MaintenanceTaskItemInstance } from "../../models/tasks/maintenance/maintenanceTaskItemModel";
import { TaskStatusType } from "../../types/taskStatusType";
import { ApiError } from "../../utils/ApiError";

const {
  MaintenanceTemplate,
  MaintenanceTemplateItem,
  MaintenanceTask,
  MaintenanceTaskItem,
  Device, Boiler, BoilerDevice
} = models;
type TaskStatus = TaskStatusType
const maintenanceService = {
  // 📌 TEMPLATE CRUD

  getAllTemplates: async () => {
    return await MaintenanceTemplate.findAll({
      include: [{ model: MaintenanceTemplateItem, as: "items" }],
    });
  },

  getTemplateById: async (id: number) => {
    const template = await MaintenanceTemplate.findByPk(id, {
      include: [{ model: MaintenanceTemplateItem, as: "items" }],
    });
    if (!template) throw new ApiError(404, "Maintenance template not found");
    return template;
  },

  createTemplate: async (data: any) => {
    const { title, deviceType, description, items } = data;

    const template = await MaintenanceTemplate.create(
      {
        title,
        description,
        items,
      } as any,
      {
        include: [
          {
            model: MaintenanceTemplateItem,
            as: "items",
          },
        ],
      }
    );

    return template;
  },

  updateTemplate: async (id: number, data: any) => {
    const template = await MaintenanceTemplate.findByPk(id);
    if (!template) throw new ApiError(404, "Maintenance template not found");

    await template.update(data);
    return template;
  },

  deleteTemplate: async (id: number) => {
    const deleted = await MaintenanceTemplate.destroy({ where: { id } });
    if (!deleted) throw new ApiError(404, "Maintenance template not found");
    return { message: "Deleted successfully" };
  },

  // 📌 TASK CRUD

  getMaintenanceTasksByBoilerAndDate: async (boilerId: number, date: string) => {
    return await MaintenanceTask.findAll({
      include: [
        {
          model: Device,
          as: 'device',
          include: [
            {
              model: BoilerDevice,  // Thêm include cho BoilerDevice
              as: 'boilerDevices',  // Alias cho quan hệ giữa Device và BoilerDevice
              where: { boilerId },  // Điều kiện để lọc các BoilerDevice theo boilerId
              attributes: [],  // Không cần lấy thuộc tính nào từ BoilerDevice
            }
          ],
        },
        {
          model: MaintenanceTaskItem, as: 'items' // Bao gồm các công việc bảo trì con
        },
      ],
      where: {
        scheduledDate: date,  // Lọc theo ngày dự kiến thực hiện
      },
    });
  },

  createTask: async (data: any) => {
    const { deviceId, createdBy, templateId, scheduledDate, items } = data;

    const task = await MaintenanceTask.create(
      {
        deviceId, createdBy,
        templateId,
        scheduledDate,
        status: "pending",
        items,
      } as any,
      {
        include: [{ model: MaintenanceTaskItem, as: "items" }],
      }
    );
    return task;
  },
  completeTaskItem: async (
    itemId: number,
    result?: string | null,
    photoUrl?: string | null
  ): Promise<MaintenanceTaskItemInstance> => {
    const transaction = await sequelize.transaction();
    try {
      // 1. Tìm và cập nhật MaintenanceTaskItem
      const taskItem = await models.MaintenanceTaskItem.findByPk(itemId, {
        transaction,
      });
      if (!taskItem) {
        throw new ApiError(
          404,
          `Maintenance task item with ID ${itemId} not found.`
        );
      }

      // Kiểm tra xem đã hoàn thành chưa (tùy chọn, có thể bỏ qua nếu muốn cho phép cập nhật lại)
      if (taskItem.status === "done") {
        console.warn(`Task item ${itemId} already marked as done. Skipping update.`);
        await transaction.commit();
        return taskItem;
      }

      await taskItem.update(
        {
          result,
          photoUrl,
          status: "done",
        },
        { transaction }
      );

      // 2. Kiểm tra và cập nhật trạng thái MaintenanceTask cha
      const taskId = taskItem.taskId;
      const parentTask = await models.MaintenanceTask.findByPk(taskId, {
        include: [
          {
            model: models.MaintenanceTaskItem,
            as: "items",
            attributes: ["id", "status"],
          },
        ],
        transaction,
      });

      if (!parentTask || !parentTask.items) {
        console.error(
          `Parent task with ID ${taskId} not found or has no items after updating item ${itemId}.`
        );
        throw new ApiError(
          500,
          `Could not find parent task or its items for task ID ${taskId}.`
        );
      }

      const totalItems = parentTask.items.length;
      const completedItems = parentTask.items.filter(
        (item: { status: string; }) => item.status === "done"
      ).length;

      let newParentStatus = parentTask.status;

      if (completedItems === totalItems) {
        newParentStatus = "completed";
      } else if (completedItems > 0 && parentTask.status === "pending") {
        newParentStatus = "in_process";
      }

      if (newParentStatus !== parentTask.status) {
        await parentTask.update({ status: newParentStatus }, { transaction });
      }

      await transaction.commit();

      // Trả về item vừa được cập nhật
      return await taskItem.reload();
    } catch (error: any) {
      await transaction.rollback();
      console.error(`Error completing maintenance task item ${itemId}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        500,
        error.message || `Failed to complete maintenance task item ${itemId}.`
      );
    }
  }, acceptTask: async (userId: number, taskId: number) => {
    // Lấy task từ DB
    const task = await MaintenanceTask.findOne({
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
  updateTaskStatus: async (taskId: number, status: TaskStatus) => {
    const task = await MaintenanceTask.findByPk(taskId);
    if (!task) throw new ApiError(404, "Maintenance task not found");

    await task.update({ status });
    return task;
  },
};

export default maintenanceService;
