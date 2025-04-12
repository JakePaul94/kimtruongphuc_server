import { models } from "../../config/database";
import { TaskStatusType } from "../../types/taskStatusType";
import { ApiError } from "../../utils/ApiError";

const {
  MaintenanceTemplate,
  MaintenanceTemplateItem,
  MaintenanceTask,
  MaintenanceTaskItem,
  Device,
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
    const { name, boilerId, description, items } = data;

    const template = await MaintenanceTemplate.create(
      {
        name,
        boilerId,
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
      where: { scheduledDate: date },
      include: [
        {
          model: Device,
          as: "device",
          where: { boilerId },
        },
        {
          model: MaintenanceTaskItem,
          as: "items",
        },
      ],
    });
  },

  createTask: async (data: any) => {
    const { boilerId, deviceId, templateId, scheduledDate, items } = data;

    const task = await MaintenanceTask.create(
      {
        boilerId,
        deviceId,
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
  
  updateTaskStatus: async (taskId: number, status: TaskStatus) => {
    const task = await MaintenanceTask.findByPk(taskId);
    if (!task) throw new ApiError(404, "Maintenance task not found");

    await task.update({ status });
    return task;
  },
};

export default maintenanceService;
