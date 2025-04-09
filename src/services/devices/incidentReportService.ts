import { models } from "../../config/database";
import { ApiError } from "../../utils/ApiError";

const { IncidentReport, IncidentReportPhoto, Device, User } = models;

const incidentReportService = {
  getAllReports: async () => {
    return await IncidentReport.findAll({
      include: [
        { model: Device, as: "device" },
        { model: User, as: "reporter" },
        { model: IncidentReportPhoto, as: "photos" },
      ],
      order: [["createdAt", "DESC"]],
    });
  },

  getReportById: async (id: number) => {
    const report = await IncidentReport.findByPk(id, {
      include: [
        { model: Device, as: "device" },
        { model: User, as: "reporter" },
        { model: IncidentReportPhoto, as: "photos" },
      ],
    });

    if (!report) throw new ApiError(404, "Incident report not found");
    return report;
  },

  createReport: async (data: {
    deviceId: number;
    reportedBy: number;
    description: string;
    photos?: string[];
  }) => {
    const { deviceId, reportedBy, description, photos } = data;

    const report = await IncidentReport.create(
      {
        deviceId,
        reportedBy,
        description,
        status: "pending",
        photos: photos?.map((url) => ({ photoUrl: url })),
      } as any,
      {
        include: [{ model: IncidentReportPhoto, as: "photos" }],
      }
    );

    return report;
  },

  updateStatus: async (id: number, status: "pending" | "in_progress" | "resolved") => {
    const report = await IncidentReport.findByPk(id);
    if (!report) throw new ApiError(404, "Incident report not found");

    await report.update({ status });
    return report;
  },

  deleteReport: async (id: number) => {
    const deleted = await IncidentReport.destroy({ where: { id } });
    if (!deleted) throw new ApiError(404, "Incident report not found");
    return { message: "Deleted successfully" };
  },
};

export default incidentReportService;
