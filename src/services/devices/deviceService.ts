import { Op } from 'sequelize';
import { models } from '../../config/database'; 
import { DeviceAttributes, DeviceInstance } from '../../models/devices/devicesModel'; 
import { MaintenanceRecordInstance } from '../../models/devices/maintenanceRecordModel'; 
import { ApiError } from '../../utils/ApiError'; 


// Destructure các models cần thiết từ object models
const { Device, MaintenanceRecord, InspectionRecord, DeviceDocument } = models;

const createDevice = async (deviceData: Omit<DeviceAttributes, 'id'>): Promise<DeviceInstance> => {
  if (await Device.findOne({ where: { deviceCode: deviceData.deviceCode } })) {
    throw new ApiError(401, 'Mã thiết bị đã tồn tại');
  }
  if (deviceData.parentId) {
      const parentDevice = await Device.findByPk(deviceData.parentId);
      if (!parentDevice) {
           throw new ApiError(401, `Thiết bị cha với ID ${deviceData.parentId} không tồn tại.`);
      }
  }
  return Device.create(deviceData);
};


const getDeviceById = async (id: number, includeOptions?: object): Promise<DeviceInstance | null> => {
  return Device.findByPk(id, includeOptions);
};


const getAllDevices = async (options: {
  filter?: Partial<DeviceAttributes>;
  limit?: number;
  offset?: number;
  order?: Array<[string, string]>;
  include?: any[];
} = {}): Promise<{ rows: DeviceInstance[], count: number }> => {
  const { filter = {}, limit, offset, order, include = [] } = options;

  const whereCondition: any = {};
  for (const key in filter) {
    if (Object.prototype.hasOwnProperty.call(filter, key) && filter[key as keyof DeviceAttributes] !== undefined) {
      if (typeof filter[key as keyof DeviceAttributes] === 'string') {
        whereCondition[key] = { [Op.like]: `%${filter[key as keyof DeviceAttributes]}%` };
      } else {
        whereCondition[key] = filter[key as keyof DeviceAttributes];
      }
    }
  }

  return Device.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order,
    include,
    distinct: true, // Quan trọng khi dùng include và limit/offset
  });
};


const updateDevice = async (id: number, updateData: Partial<DeviceAttributes>): Promise<DeviceInstance> => {
  // Dùng getDeviceById thay vì findByPk để có thể tái sử dụng logic include nếu cần
  const device = await getDeviceById(id);
  if (!device) {
    throw new ApiError(402, 'Không tìm thấy thiết bị');
  }

  if (updateData.deviceCode && updateData.deviceCode !== device.deviceCode) {
    if (await Device.findOne({ where: { deviceCode: updateData.deviceCode, id: { [Op.ne]: id } } })) {
      throw new ApiError(400, 'Mã thiết bị đã tồn tại');
    }
  }

   // Kiểm tra parentId tồn tại nếu được cập nhật
   if (updateData.parentId && updateData.parentId !== device.parentId) {
    const parentDevice = await Device.findByPk(updateData.parentId);
    if (!parentDevice) {
         throw new ApiError(400, `Thiết bị cha với ID ${updateData.parentId} không tồn tại.`);
    }
  }

  // Chỉ cập nhật các trường được cung cấp trong updateData
  Object.keys(updateData).forEach((key) => {
     (device as any)[key] = updateData[key as keyof DeviceAttributes];
  });

  await device.save();
  return device.reload(); // Reload để lấy dữ liệu mới nhất từ DB
};


const deleteDeviceById = async (id: number): Promise<void> => {
  const device = await getDeviceById(id);
  if (!device) {
    throw new ApiError(402, 'Không tìm thấy thiết bị');
  }
  await device.destroy();
};


const getSubDevices = async (parentId: number): Promise<DeviceInstance[]> => {
  return Device.findAll({ where: { parentId } });
};


const getDeviceMaintenanceRecords = async (deviceId: number): Promise<any[]> => {
  const device = await Device.findByPk(deviceId, {
    include: [{ model: MaintenanceRecord, as: 'maintenanceRecords' }]
  });
  if (!device) {
    throw new ApiError(402, 'Không tìm thấy thiết bị');}
  return (device as any).maintenanceRecords || [];
};


export const deviceService = {
  createDevice,
  getDeviceById,
  getAllDevices,
  updateDevice,
  deleteDeviceById,
  getSubDevices,
  getDeviceMaintenanceRecords
};