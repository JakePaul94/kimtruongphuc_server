import { models } from "../../config/database";
import { ApiError } from "../../utils/ApiError";

const { AdHocTask, AdHocTaskLog, Device, User, Boiler } = models;

type TaskStatus = "pending" | "in_progress" | "done";

const adHocTaskService = {
  // 📌 Lấy tất cả task theo boilerId và ngày
  getTasksByBoilerAndDate: async (boilerId: number, date: string) => {
    return await AdHocTask.findAll({
      where: { boilerId, scheduledDate: date },
      include: [
        {
          model: Device,
          as: "device",
        },
        {
          model: User,
          as: "assignedUser",
        },
        {
          model: User,
          as: "creator",
        },
        {
          model: AdHocTaskLog,
          as: "logs",
        },
      ],
    });
  },
  getTasksByUserAndDate: async (userId: number, date: string) => {
    return await AdHocTask.findAll({
      where: { assignedTo: userId, scheduledDate: date },
      include: [
        { model: Device, as: "device" },
        { model: Boiler, as: "boiler" },
        { model: User, as: "creator" },
        { model: AdHocTaskLog, as: "logs" },
      ],
    });
  },
  // 📌 Tạo task bất chợt
  createTask: async (data: {
    title: string;
    description?: string;
    deviceId: number;
    assignedTo?: number | null;
    createdBy: number;
    boilerId?: number | null;
    scheduledDate: Date;
    status?: TaskStatus;
  }) => {
    const task = await AdHocTask.create({
      title: data.title,
      description: data.description,
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
  updateTaskStatus: async (taskId: number, status: TaskStatus) => {
    const task = await AdHocTask.findByPk(taskId);
    if (!task) throw new ApiError(404, "Ad-hoc task not found");

    await task.update({ status });
    return task;
  },

  // 📌 Thêm log cho task (ghi chú và ảnh)
  addTaskLog: async (
    adHocTaskId: number,
    createdBy: number,
    note?: string,
    photoUrl?: string
  ) => {
    const task = await AdHocTask.findByPk(adHocTaskId);
    if (!task) throw new ApiError(404, "Ad-hoc task not found");

    const log = await AdHocTaskLog.create({
      adHocTaskId,
      createdBy,
      note,
      photoUrl,
    });

    return log;
  },

  // 📌 Xoá task
  deleteTask: async (taskId: number) => {
    const deleted = await AdHocTask.destroy({ where: { id: taskId } });
    if (!deleted) throw new ApiError(404, "Ad-hoc task not found");
    return { message: "Deleted successfully" };
  },
};

export default adHocTaskService;
