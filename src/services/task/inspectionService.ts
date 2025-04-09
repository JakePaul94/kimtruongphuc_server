import { models } from "../../config/database";

import { ApiError } from "../../utils/ApiError";

const {
  InspectionTemplate,
  InspectionTemplateItem,
  InspectionTask,
  InspectionTaskItem,
  Device,
} = models;

const inspectionService = {
  // 📌 TEMPLATE CRUD

  getAllTemplates: async () => {
    return await InspectionTemplate.findAll({
      include: [{ model: InspectionTemplateItem, as: "items" }],
    });
  },

  getTemplateById: async (id: number) => {
    const template = await InspectionTemplate.findByPk(id, {
      include: [{ model: InspectionTemplateItem, as: "items" }],
    });
    if (!template) throw new ApiError(404, "Inspection template not found");
    return template;
  },

  createTemplate: async (data: any) => {
    const { name, boilerId, description, items } = data;

    const template = await InspectionTemplate.create(
      {
        name,
        boilerId,
        description,
        items,
      } as any,
      {
        include: [
          {
            model: InspectionTemplateItem,
            as: "items",
          },
        ],
      }
    );

    return template;
  },

  updateTemplate: async (id: number, data: any) => {
    const template = await InspectionTemplate.findByPk(id);
    if (!template) throw new ApiError(404, "Inspection template not found");

    await template.update(data);
    return template;
  },

  deleteTemplate: async (id: number) => {
    const deleted = await InspectionTemplate.destroy({ where: { id } });
    if (!deleted) throw new ApiError(404, "Inspection template not found");
    return { message: "Deleted successfully" };
  },

  // 📌 TASK CRUD

  getInspectionTasksByBoilerAndDate: async (boilerId: number, date: string) => {
    return await InspectionTask.findAll({
      include: [
        {
          model: Device,
          as: "device",
          where: { boilerId },
        },
      ],
    });
  },

  createTask: async (data: any) => {
    const { boilerId, date, createdBy, items, templateId, scheduledDate } =
      data;

    const task = await InspectionTask.create(
      {
        boilerId,
        templateId,
        scheduledDate,
        date,
        createdBy,
        items,
      } as any,
      {
        include: [{ model: InspectionTaskItem, as: "items" }],
      }
    );
    return task;
  },

  updateTaskStatus: async (taskId: number, status: string) => {
    const task = await InspectionTask.findByPk(taskId);
    if (!task) throw new ApiError(404, "Inspection task not found");

    await task.update({ status });
    return task;
  },
};

export default inspectionService;
