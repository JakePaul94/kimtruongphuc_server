// src/services/devices/maintenanceRecordService.ts

import { models } from '../../config/database'; // Điều chỉnh đường dẫn nếu cần
// Import đúng interface từ file model MaintenanceRecord
import { MaintenanceRecordAttributes, MaintenanceRecordInstance } from '../../models/devices/maintenanceRecordModel'; // Điều chỉnh đường dẫn nếu cần
import { ApiError } from '../../utils/ApiError'; 
import { deviceService } from './deviceService';


const { MaintenanceRecord, Device } = models;

const createMaintenanceRecord = async (recordData: Omit<MaintenanceRecordAttributes, 'id'>): Promise<MaintenanceRecordInstance> => {
    const deviceExists = await deviceService.getDeviceById(recordData.deviceId);
    if (!deviceExists) {
        throw new ApiError(404, `Không tìm thấy thiết bị với ID ${recordData.deviceId}`);
    }
    const newRecord = await MaintenanceRecord.create(recordData);
    try {
        const updatePayload: any = {
            lastMaintenanceDate: newRecord.performedAt,
             // Giả sử sau khi bảo trì thì isNeedMaintenance = false
            isNeedMaintenance: false,
        };
        await deviceService.updateDevice(recordData.deviceId, updatePayload);
    } catch (error) {
        console.error(`Lỗi khi cập nhật thiết bị ${recordData.deviceId} sau khi tạo bản ghi bảo trì:`, error);
    }

    return newRecord;
};

const getMaintenanceRecordById = async (id: number): Promise<MaintenanceRecordInstance | null> => {
    return MaintenanceRecord.findByPk(id, {
        include: [{ model: Device, as: 'device', attributes: ['id', 'deviceCode', 'deviceName'] }]
    });
};

const getMaintenanceRecordsByDeviceId = async (deviceId: number, options: {
    limit?: number;
    offset?: number;
    order?: Array<[string, string]>;
} = {}): Promise<{ rows: MaintenanceRecordInstance[], count: number }> => {
    const { limit, offset, order = [['performedAt', 'DESC']] } = options;
    return MaintenanceRecord.findAndCountAll({
        where: { deviceId },
        limit,
        offset,
        order,
    });
};

const updateMaintenanceRecord = async (id: number, updateData: Partial<Omit<MaintenanceRecordAttributes, 'deviceId'>>): Promise<MaintenanceRecordInstance> => {
    const record = await MaintenanceRecord.findByPk(id);
    if (!record) {
        throw new ApiError(404, 'Không tìm thấy bản ghi bảo trì');
    }

    Object.assign(record, updateData);
    await record.save();

    if (updateData.performedAt) {
         try {
            // Tìm bản ghi bảo trì mới nhất để cập nhật lastMaintenanceDate
            const latestRecord = await MaintenanceRecord.findOne({
                where: { deviceId: record.deviceId },
                order: [['performedAt', 'DESC']],
            });

             const updatePayload: any = {
                 lastMaintenanceDate: latestRecord?.performedAt || null,
                 // Cập nhật lại isNeedMaintenance nếu cần
                 // isNeedMaintenance: false,
             };
            await deviceService.updateDevice(record.deviceId, updatePayload);
        } catch (error) {
            console.error(`Lỗi khi cập nhật thiết bị ${record.deviceId} sau khi cập nhật bản ghi bảo trì ${id}:`, error);
        }
    }

    return record.reload({
        include: [{ model: Device, as: 'device', attributes: ['id', 'deviceCode', 'deviceName'] }]
    });
};

const deleteMaintenanceRecord = async (id: number): Promise<void> => {
    const record = await MaintenanceRecord.findByPk(id);
    if (!record) {
        throw new ApiError(404, 'Không tìm thấy bản ghi bảo trì');
    }
    const deviceId = record.deviceId;

    await record.destroy();

    // Sau khi xóa, cập nhật lại thông tin trên Device
    try {
        const latestRecord = await MaintenanceRecord.findOne({
            where: { deviceId: deviceId },
            order: [['performedAt', 'DESC']],
        });

        const updatePayload: any = {
            lastMaintenanceDate: latestRecord?.performedAt || null,
            // Cập nhật lại isNeedMaintenance nếu cần
        };

        await deviceService.updateDevice(deviceId, updatePayload);
    } catch (error) {
        console.error(`Lỗi khi cập nhật thiết bị ${deviceId} sau khi xóa bản ghi bảo trì ${id}:`, error);
    }
};



const getLatestMaintenanceRecordByDeviceId = async (deviceId: number): Promise<MaintenanceRecordInstance | null> => {


    return MaintenanceRecord.findOne({
        where: { deviceId },
        order: [
            ['performedAt', 'DESC'], 
            ['createdAt', 'DESC']   
        ],
        
    });
};



export const maintenanceRecordService = {
    createMaintenanceRecord,
    getMaintenanceRecordById,
    getMaintenanceRecordsByDeviceId,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    getLatestMaintenanceRecordByDeviceId, // <-- Thêm hàm mới vào export
};