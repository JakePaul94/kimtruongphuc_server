import { Op } from "sequelize";
import { models } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { TaskStatusType } from "../../types/taskStatusType";

const { AdHocTask, AdHocTaskLog, Device, User, Boiler } = models;

export type TaskStatus = TaskStatusType;

interface CreateTaskPayload {
  title: string;
  description?: string;
  deviceId: number;
  assignedTo?: number | null;
  createdBy: number;
  boilerId?: number | null;
  scheduledDate: Date;
  status?: TaskStatus;
}

const adHocTaskService = {
  // 📌 Lấy tất cả task theo boilerId và ngày
  async getTasksByBoilerAndDate(boilerId: number, date: string) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);

    return await AdHocTask.findAll({
      where: {
        boilerId: { [Op.eq]: boilerId },
        scheduledDate: { [Op.between]: [start, end] },
      },
      include: [
        { model: Device, as: "device" },
        { model: User, as: "assignedToUser" },
        { model: AdHocTaskLog, as: "logs" },
      ],
    });
  },

  // 📌 Lấy task theo user và ngày
  async getTasksByUserAndDate(userId: number, date: string) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);
    return await AdHocTask.findAll({
      where: {
        assignedTo: { [Op.eq]: userId },
        scheduledDate: { [Op.between]: [start, end] },
      },
      include: [
        { model: Device, as: "device" },
        { model: Boiler, as: "boiler" },
        { model: User, as: "creator" },
        { model: AdHocTaskLog, as: "logs" },
      ],
    });
  },
  async getTaskById(taskId: number) {
    const task = await AdHocTask.findByPk(taskId, {
      include: [
        { model: Device, as: "device" },
        { model: Boiler, as: "boiler" },
        { model: User, as: "creator" },
        { model: User, as: "assignedToUser" },
        {
          model: AdHocTaskLog,
          as: "logs",
          include: [{ model: User, as: "creator" }],
        },
      ],
    });

    if (!task) throw new ApiError(404, "Ad-hoc task not found");

    return task;
  },
  async updateTaskInfo(taskId: number, updates: Partial<CreateTaskPayload>) {
    const task = await AdHocTask.findByPk(taskId);
    if (!task) throw new ApiError(404, "Ad-hoc task not found");

    await task.update(updates);
    return task;
  },

  async createTask(data: CreateTaskPayload) {
    const task = await AdHocTask.create({
      title: data.title,
      description: data.description ?? null,
      deviceId: data.deviceId,
      assignedTo: data.assignedTo ?? null,
      createdBy: data.createdBy,
      boilerId: data.boilerId ?? null,
      scheduledDate: data.scheduledDate,
      status: data.status ?? "pending",
    });

    return task;
  },

  // 📌 Cập nhật trạng thái task
  async updateTaskStatus(taskId: number, status: TaskStatus) {
    const task = await AdHocTask.findByPk(taskId);
    if (!task) {
      throw new ApiError(404, "Ad-hoc task not found");
    }

    await task.update({ status });
    return task;
  },

  // 📌 Thêm log cho task (ghi chú và ảnh)
  async addTaskLog(
    adHocTaskId: number,
    createdBy: number,
    note?: string,
    photoUrl?: string
  ) {
    const task = await AdHocTask.findByPk(adHocTaskId);
    if (!task) {
      throw new ApiError(404, "Ad-hoc task not found");
    }

    const log = await AdHocTaskLog.create({
      adHocTaskId,
      createdBy,
      note: note ?? null,
      photoUrl: photoUrl ?? null,
    });

    return log;
  },
  async getLogsByTaskId(adHocTaskId: number) {
    const task = await AdHocTask.findByPk(adHocTaskId);
    if (!task) {
      throw new ApiError(404, "Ad-hoc task not found");
    }

    return await AdHocTaskLog.findAll({
      where: { adHocTaskId },
      include: [{ model: User, as: "creator" }],
      order: [["createdAt", "ASC"]],
    });
  },
  // 📌 Xoá task
  async deleteTask(taskId: number) {
    const deletedCount = await AdHocTask.destroy({
      where: { id: taskId },
    });

    if (deletedCount === 0) {
      throw new ApiError(404, "Ad-hoc task not found");
    }

    return { message: "Deleted successfully" };
  },
};

export default adHocTaskService;
