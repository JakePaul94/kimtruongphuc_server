import { Request, Response, NextFunction } from 'express';
import { maintenanceRecordService } from '../../services/devices/maintenanceRecordService';
import { ApiError } from '../../utils/ApiError';

export const maintenanceRecordController = {
    // POST /devices/:deviceId/maintenance
    createMaintenanceRecord: async (req: Request, res: Response, next: NextFunction) => {
        // >>> TODO: Thêm validation cho req.body <<<
        try {
            const deviceId = parseInt(req.params.deviceId, 10);
            if (isNaN(deviceId)) {
                 throw new ApiError(400, 'ID thiết bị không hợp lệ');
            }
            // Gán deviceId từ param vào body để tạo record
            const recordData = { ...req.body, deviceId };
            const newRecord = await maintenanceRecordService.createMaintenanceRecord(recordData);
            res.status(201).json(newRecord);
        } catch (error) {
            next(error);
        }
    },

    // GET /devices/:deviceId/maintenance
    getMaintenanceRecordsForDevice: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const deviceId = parseInt(req.params.deviceId, 10);
             if (isNaN(deviceId)) {
                 throw new ApiError(400, 'ID thiết bị không hợp lệ');
            }
             // Lấy các tham số phân trang, sắp xếp từ query string
            const { limit, offset, order } = req.query;
            const limitNum = limit ? parseInt(limit as string, 10) : undefined;
            const offsetNum = offset ? parseInt(offset as string, 10) : undefined;
            let orderArray: Array<[string, string]> | undefined;
             if (typeof order === 'string') {
                orderArray = order.split(',').map(pair => {
                    const [field, direction = 'ASC'] = pair.split(':');
                    return [field, direction.toUpperCase()];
                }) as Array<[string, string]>;
            }

            const options = { limit: limitNum, offset: offsetNum, order: orderArray };
            const result = await maintenanceRecordService.getMaintenanceRecordsByDeviceId(deviceId, options);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

     // GET /devices/:deviceId/maintenance/latest
    getLatestMaintenanceRecordForDevice: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const deviceId = parseInt(req.params.deviceId, 10);
             if (isNaN(deviceId)) {
                 throw new ApiError(400, 'ID thiết bị không hợp lệ');
            }
            const latestRecord = await maintenanceRecordService.getLatestMaintenanceRecordByDeviceId(deviceId);
             if (!latestRecord) {
                throw new ApiError(404, 'Không tìm thấy bản ghi bảo trì nào cho thiết bị này');
            }
            res.status(200).json(latestRecord);
        } catch (error) {
            next(error);
        }
    },

    // GET /maintenance/:id  (Route không lồng)
    getMaintenanceRecordById: async (req: Request, res: Response, next: NextFunction) => {
        try {
             const id = parseInt(req.params.id, 10);
              if (isNaN(id)) {
                 throw new ApiError(400, 'ID bản ghi bảo trì không hợp lệ');
             }
            const record = await maintenanceRecordService.getMaintenanceRecordById(id);
            if (!record) {
                throw new ApiError(404, 'Không tìm thấy bản ghi bảo trì');
            }
            res.status(200).json(record);
        } catch (error) {
            next(error);
        }
    },

    // PUT /maintenance/:id (Route không lồng)
    updateMaintenanceRecord: async (req: Request, res: Response, next: NextFunction) => {
        // >>> TODO: Thêm validation cho req.body <<<
        try {
             const id = parseInt(req.params.id, 10);
             if (isNaN(id)) {
                 throw new ApiError(400, 'ID bản ghi bảo trì không hợp lệ');
             }
             // Không cho phép cập nhật deviceId qua API này
             const { deviceId, ...updateData } = req.body;
            const updatedRecord = await maintenanceRecordService.updateMaintenanceRecord(id, updateData);
            res.status(200).json(updatedRecord);
        } catch (error) {
            next(error);
        }
    },

    // DELETE /maintenance/:id (Route không lồng)
    deleteMaintenanceRecord: async (req: Request, res: Response, next: NextFunction) => {
         try {
             const id = parseInt(req.params.id, 10);
              if (isNaN(id)) {
                 throw new ApiError(400, 'ID bản ghi bảo trì không hợp lệ');
             }
            await maintenanceRecordService.deleteMaintenanceRecord(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },
};