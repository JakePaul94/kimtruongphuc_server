// src/services/devices/inspectionRecordService.ts

import { models } from "../../config/database"; // Điều chỉnh đường dẫn nếu cần
// Import đúng interface từ file model đã cung cấp
import {
  InspectionRecordAttributes,
  InspectionRecordInstance,
} from "../../models/devices/inspectionRecordModel"; // Điều chỉnh đường dẫn nếu cần
import { ApiError } from "../../utils/ApiError"; // Điều chỉnh đường dẫn nếu cần
import { deviceService } from "./deviceService";
import { Op } from "sequelize"; // Import Op nếu cần dùng (ví dụ: khi tìm latest record)

const { InspectionRecord, Device } = models;

const createInspectionRecord = async (
  recordData: Omit<InspectionRecordAttributes, "id">
): Promise<InspectionRecordInstance> => {
  const deviceExists = await deviceService.getDeviceById(recordData.deviceId);
  if (!deviceExists) {
    throw new ApiError(
      404,
      `Không tìm thấy thiết bị với ID ${recordData.deviceId}`
    );
  }

  // Dữ liệu truyền vào khớp với InspectionRecordAttributes (trừ id)
  const newRecord = await InspectionRecord.create(recordData);

  // Cập nhật thông tin kiểm định trên thiết bị chính
  try {
    const updatePayload: any = {
      lastInspectionDate: newRecord.performedAt,
      inspectionStatus: newRecord.result || null, // Lấy kết quả, nếu không có thì null
    };
    await deviceService.updateDevice(recordData.deviceId, updatePayload);
  } catch (error) {
    console.error(
      `Lỗi khi cập nhật thiết bị ${recordData.deviceId} sau khi tạo bản ghi kiểm định:`,
      error
    );
  }

  return newRecord;
};

const getInspectionRecordById = async (
  id: number
): Promise<InspectionRecordInstance | null> => {
  return InspectionRecord.findByPk(id, {
    include: [
      {
        model: Device,
        as: "device",
        attributes: ["id", "deviceCode", "deviceName"],
      },
    ],
  });
};

const getInspectionRecordsByDeviceId = async (
  deviceId: number,
  options: {
    limit?: number;
    offset?: number;
    order?: Array<[string, string]>;
  } = {}
): Promise<{ rows: InspectionRecordInstance[]; count: number }> => {
  const { limit, offset, order = [["performedAt", "DESC"]] } = options;
  return InspectionRecord.findAndCountAll({
    where: { deviceId },
    limit,
    offset,
    order,
  });
};

const updateInspectionRecord = async (
  id: number,
  updateData: Partial<Omit<InspectionRecordAttributes, "deviceId">>
): Promise<InspectionRecordInstance> => {
  const record = await InspectionRecord.findByPk(id);
  if (!record) {
    throw new ApiError(404, "Không tìm thấy bản ghi kiểm định");
  }

  // Dữ liệu cập nhật khớp với InspectionRecordAttributes (trừ id và deviceId)
  Object.assign(record, updateData);
  await record.save();

  // Cập nhật lại thông tin trên Device nếu ngày thực hiện hoặc kết quả thay đổi
  if (updateData.performedAt || updateData.result !== undefined) {
    // Chỉ kiểm tra result !== undefined vì nó có thể là null/''
    try {
      // Tìm bản ghi kiểm định mới nhất để cập nhật lastInspectionDate và status
      const latestRecord = await InspectionRecord.findOne({
        where: { deviceId: record.deviceId },
        order: [["performedAt", "DESC"]],
      });

      const updatePayload: any = {
        lastInspectionDate: latestRecord?.performedAt || null,
        inspectionStatus: latestRecord?.result || null,
      };

      await deviceService.updateDevice(record.deviceId, updatePayload);
    } catch (error) {
      console.error(
        `Lỗi khi cập nhật thiết bị ${record.deviceId} sau khi cập nhật bản ghi kiểm định ${id}:`,
        error
      );
    }
  }

  return record.reload({
    include: [
      {
        model: Device,
        as: "device",
        attributes: ["id", "deviceCode", "deviceName"],
      },
    ],
  });
};

const deleteInspectionRecord = async (id: number): Promise<void> => {
  const record = await InspectionRecord.findByPk(id);
  if (!record) {
    throw new ApiError(404, "Không tìm thấy bản ghi kiểm định");
  }
  const deviceId = record.deviceId;

  await record.destroy();

  try {
    const latestRecord = await InspectionRecord.findOne({
      where: { deviceId: deviceId },
      order: [["performedAt", "DESC"]],
    });

    const updatePayload: any = {
      lastInspectionDate: latestRecord?.performedAt || null,
      inspectionStatus: latestRecord?.result || null,
    };

    await deviceService.updateDevice(deviceId, updatePayload);
  } catch (error) {
    console.error(
      `Lỗi khi cập nhật thiết bị ${deviceId} sau khi xóa bản ghi kiểm định ${id}:`,
      error
    );
  }
};
const getLatestInspectionRecordByDeviceId = async (
  deviceId: number
): Promise<InspectionRecordInstance | null> => {
  return InspectionRecord.findOne({
    where: { deviceId },
    order: [
      ["performedAt", "DESC"],
      ["createdAt", "DESC"],
    ],
  });
};
export const inspectionRecordService = {
  createInspectionRecord,
  getInspectionRecordById,
  getInspectionRecordsByDeviceId,
  updateInspectionRecord,
  deleteInspectionRecord,
  getLatestInspectionRecordByDeviceId,
};
