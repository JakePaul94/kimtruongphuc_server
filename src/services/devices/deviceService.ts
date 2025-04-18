import { Op } from "sequelize";
import { models } from "../../config/database";
import {
  DeviceAttributes,
  DeviceInstance,
} from "../../models/devices/devicesModel";
import { ApiError } from "../../utils/ApiError";

const {
  Device,
  DeviceDocument,
  MaintenanceTask,
  InspectionTask,
  Boiler,
  BoilerDevice,
  BoilerUser,
} = models;

const createDevice = async (
  deviceData: Omit<DeviceAttributes, "id">
): Promise<DeviceInstance> => {
  if (await Device.findOne({ where: { deviceCode: deviceData.deviceCode } })) {
    throw new ApiError(401, "Mã thiết bị đã tồn tại");
  }

  if (deviceData.parentId) {
    const parentDevice = await Device.findByPk(deviceData.parentId);
    if (!parentDevice) {
      throw new ApiError(
        401,
        `Thiết bị cha với ID ${deviceData.parentId} không tồn tại.`
      );
    }
  }

  return Device.create(deviceData);
};

const getDeviceById = async (
  id: number,
  includeOptions?: object
): Promise<DeviceInstance | null> => {
  return Device.findByPk(id, includeOptions);
};

const getAllDevices = async (): Promise<DeviceAttributes[]> => {
  try {
    const devices = await Device.findAll({ raw: true });
    return devices;
  } catch (error) {
    console.error('Lỗi khi lấy tất cả thiết bị:', error);
    throw error;
  }
};


const updateDevice = async (
  id: number,
  updateData: Partial<DeviceAttributes>
): Promise<DeviceInstance> => {
  const device = await getDeviceById(id);
  if (!device) {
    throw new ApiError(402, "Không tìm thấy thiết bị");
  }

  if (updateData.deviceCode && updateData.deviceCode !== device.deviceCode) {
    if (
      await Device.findOne({
        where: { deviceCode: updateData.deviceCode, id: { [Op.ne]: id } },
      })
    ) {
      throw new ApiError(400, "Mã thiết bị đã tồn tại");
    }
  }

  if (updateData.parentId && updateData.parentId !== device.parentId) {
    const parentDevice = await Device.findByPk(updateData.parentId);
    if (!parentDevice) {
      throw new ApiError(
        400,
        `Thiết bị cha với ID ${updateData.parentId} không tồn tại.`
      );
    }
  }

  Object.keys(updateData).forEach((key) => {
    (device as any)[key] = updateData[key as keyof DeviceAttributes];
  });

  await device.save();
  return device.reload();
};

const deleteDeviceById = async (id: number): Promise<void> => {
  const device = await getDeviceById(id);
  if (!device) {
    throw new ApiError(402, "Không tìm thấy thiết bị");
  }
  await device.destroy();
};

const getSubDevices = async (parentId: number): Promise<DeviceInstance[]> => {
  return Device.findAll({ where: { parentId } });
};

const getDeviceMaintenanceTasks = async (
  deviceId: number
): Promise<any[]> => {
  const device = await Device.findByPk(deviceId, {
    include: [{ model: MaintenanceTask, as: "maintenanceTasks" }],
  });
  if (!device) {
    throw new ApiError(402, "Không tìm thấy thiết bị");
  }
  return (device as any).maintenanceTasks || [];
};

const getDeviceInspectionTasks = async (
  deviceId: number
): Promise<any[]> => {
  const device = await Device.findByPk(deviceId, {
    include: [{ model: InspectionTask, as: "inspectionTasks" }],
  });
  if (!device) {
    throw new ApiError(402, "Không tìm thấy thiết bị");
  }
  return (device as any).inspectionTasks || [];
};

const getDeviceDocuments = async (deviceId: number): Promise<any[]> => {
  const device = await Device.findByPk(deviceId, {
    include: [{ model: DeviceDocument, as: "documents" }],
  });
  if (!device) {
    throw new ApiError(402, "Không tìm thấy thiết bị");
  }
  return (device as any).documents || [];
};

export const deviceService = {
  createDevice,
  getDeviceById,
  getAllDevices,
  updateDevice,
  deleteDeviceById,
  getSubDevices,
  getDeviceMaintenanceTasks,
  getDeviceInspectionTasks,
  getDeviceDocuments,
};
