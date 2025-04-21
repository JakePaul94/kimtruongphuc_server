import { models } from "../../config/database";
import { DeviceAttributes, DeviceInstance } from "../../models/devices/devicesModel";
import { ApiError } from "../../utils/ApiError";

const Boiler = models.Boiler;
const BoilerUser = models.BoilerUser;
const BoilerDevice = models.BoilerDevice;
const User = models.User;
const Device = models.Device;

const boilerService = {
  getAllBoilers: async () => {
    try {
      const boilers = await Boiler.findAll();
      return boilers;
    } catch (error: any) {
      console.error("Error fetching boilers:", error);
      throw new ApiError(500, "Failed to fetch boilers.");
    }
  },

  getBoilerById: async (id: number) => {
    try {
      const boiler = await Boiler.findByPk(id);
      if (!boiler) {
        throw new ApiError(404, `Boiler with ID ${id} not found.`);
      }
      return boiler;
    } catch (error: any) {
      console.error(`Error fetching boiler with ID ${id}:`, error);
      throw new ApiError(500, "Failed to fetch boiler.");
    }
  },
  getBoilerIdByUserId: async (userId: number) => {
    try {
      const boiler = await BoilerUser.findOne({
        where: { userId },
        include: [{ model: Boiler, as: "boiler" }],
      });
      if (!boiler) {
        throw new ApiError(404, `Boiler for user ID ${userId} not found.`);
      }
      return boiler.boilerId;
    } catch (error: any) {
      console.error(`Error fetching boiler for user ID ${userId}:`, error);
      throw new ApiError(500, "Failed to fetch boiler.");
    }
  },
  createBoiler: async (data: any) => {
    try {
      return await Boiler.create(data);
    } catch (error: any) {
      console.error("Error creating boiler:", error);
      throw new ApiError(500, "Failed to create boiler.");
    }
  },

  updateBoiler: async (id: number, data: any) => {
    try {
      const [updated] = await Boiler.update(data, { where: { id } });
      if (!updated) throw new ApiError(404, "Boiler not found.");
      return await Boiler.findByPk(id);
    } catch (error: any) {
      console.error("Error updating boiler:", error);
      throw new ApiError(500, "Failed to update boiler.");
    }
  },

  deleteBoiler: async (id: number) => {
    try {
      const deleted = await Boiler.destroy({ where: { id } });
      if (!deleted) throw new ApiError(404, "Boiler not found.");
    } catch (error: any) {
      console.error("Error deleting boiler:", error);
      throw new ApiError(500, "Failed to delete boiler.");
    }
  },

  assignUserToBoiler: async (boilerId: number, userId: number) => {
    try {
      return await BoilerUser.create({ boilerId, userId });
    } catch (error: any) {
      console.error("Error assigning user to boiler:", error);
      throw new ApiError(500, "Failed to assign user to boiler.");
    }
  },

  removeUserFromBoiler: async (boilerId: number, userId: number) => {
    try {
      const deleted = await BoilerUser.destroy({ where: { boilerId, userId } });
      if (!deleted) throw new ApiError(404, "User not found in boiler.");
    } catch (error: any) {
      console.error("Error removing user from boiler:", error);
      throw new ApiError(500, "Failed to remove user from boiler.");
    }
  },
  getAllBoilerUsers:  async () => {
    try {
      return await BoilerUser.findAll();
    } catch (error: any) {
      console.error("Error fetching boiler users:", error);
      throw new ApiError(500, "Failed to fetch boiler users.");
    }
  },
  getAllBoilerDevices:  async () => {
    try {
      return await BoilerDevice.findAll();
    } catch (error: any) {
      console.error("Error fetching boiler users:", error);
      throw new ApiError(500, "Failed to fetch boiler users.");
    }
  },
  getBoilerUsers: async (boilerId: number) => {
    try {
      return await BoilerUser.findAll({
        where: { boilerId },
        include: [{ model: User, as: "user" }], attributes: {
          exclude: ['password']
        }
      });
    } catch (error: any) {
      console.error("Error fetching boiler users:", error);
      throw new ApiError(500, "Failed to fetch boiler users.");
    }
  },

  assignDeviceToBoiler: async (boilerId: number, deviceId: number) => {
    try {
      return await BoilerDevice.create({ boilerId, deviceId });
    } catch (error: any) {
      console.error("Error assigning device to boiler:", error);
      throw new ApiError(500, "Failed to assign device to boiler.");
    }
  },
  createDeviceToBoiler: async (
    boilerId: number,
    deviceData: Omit<DeviceAttributes, "id" | "createdAt" | "updatedAt">
  ): Promise<DeviceAttributes> => {
    try {
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

      const newDevice = await Device.create(deviceData);
  
      const deviceId = newDevice.id;
      if (!deviceId) {
        throw new ApiError(500, "Không thể lấy ID thiết bị mới.");
      }
      await BoilerDevice.create({ boilerId, deviceId });
  
      return newDevice;
    } catch (error: any) {
      console.error("Error creating device and assigning to boiler:", error);
      if (error instanceof ApiError) {
        throw error; 
      }
      throw new ApiError(500, "Không thể tạo thiết bị và gán cho lò hơi."); // Lỗi chung khi tạo
    }
  },
  removeDeviceFromBoiler: async (boilerId: number, deviceId: number) => {
    try {
      const deleted = await BoilerDevice.destroy({
        where: { boilerId, deviceId },
      });
      if (!deleted) throw new ApiError(404, "Device not found in boiler.");
    } catch (error: any) {
      console.error("Error removing device from boiler:", error);
      throw new ApiError(500, "Failed to remove device from boiler.");
    }
  },

  getBoilerDevices: async (boilerId: number) => {
    try {
      return await BoilerDevice.findAll({
        where: { boilerId },
        include: [{ model: Device, as: "device" }],
      });
    } catch (error: any) {
      console.error("Error fetching boiler devices:", error);
      throw new ApiError(500, "Failed to fetch boiler devices.");
    }
  },
};

export default boilerService;
