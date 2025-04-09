import { models } from "../../config/database";
import { CreateCleaningTemplateInput } from "../../models/tasks/cleaning/cleaningTemplateModel";
import { ApiError } from "../../utils/ApiError";

const {
  CleaningTemplate,
  CleaningTemplateLocation,
  CleaningTask,
  CleaningTaskLocation,
} = models;

const cleaningService = {
  // 📌 TEMPLATE CRUD

  getAllTemplates: async () => {
    return await CleaningTemplate.findAll({
      include: [{ model: CleaningTemplateLocation, as: "locations" }],
    });
  },

  getTemplateById: async (id: number) => {
    const template = await CleaningTemplate.findByPk(id, {
      include: [{ model: CleaningTemplateLocation, as: "locations" }],
    });
    if (!template) throw new ApiError(404, "Cleaning template not found");
    return template;
  },

  createTemplate: async (data: CreateCleaningTemplateInput) => {
    const { name, boilerId, description, locations } = data;

    const template = await CleaningTemplate.create(
      {
        name,
        boilerId,
        description,
        locations,
      } as any,
      {
        include: [
          {
            model: CleaningTemplateLocation,
            as: "locations",
          },
        ],
      }
    );

    return template;
  },
  updateTemplate: async (id: number, data: any) => {
    const template = await CleaningTemplate.findByPk(id);
    if (!template) throw new ApiError(404, "Cleaning template not found");

    await template.update(data);
    return template;
  },

  deleteTemplate: async (id: number) => {
    const deleted = await CleaningTemplate.destroy({ where: { id } });
    if (!deleted) throw new ApiError(404, "Cleaning template not found");
    return { message: "Deleted successfully" };
  },

  // 📌 TASK CRUD

  getTasksByDate: async (boilerId: number, date: string) => {
    return await CleaningTask.findAll({
      where: { boilerId, date },
      include: [{ model: CleaningTaskLocation, as: "locations" }],
    });
  },

  createTask: async (data: any) => {
    const { boilerId, date, createdBy, locations, templateId, scheduledDate } =
      data;

    const task = await CleaningTask.create(
      {
        boilerId,
        templateId,
        scheduledDate,
        date,
        createdBy,
        locations,
      } as any,
      {
        include: [{ model: CleaningTaskLocation, as: "locations" }],
      }
    );
    return task;
  },

  updateTaskStatus: async (taskId: number, status: string) => {
    const task = await CleaningTask.findByPk(taskId);
    if (!task) throw new ApiError(404, "Cleaning task not found");

    await task.update({ status });
    return task;
  },
};

export default cleaningService;
