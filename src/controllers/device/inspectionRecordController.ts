import { Request, Response, NextFunction } from 'express';
import { inspectionRecordService } from '../../services/devices/inspectionRecordService';
import { ApiError } from '../../utils/ApiError';

export const inspectionRecordController = {
    // POST /devices/:deviceId/inspections
    createInspectionRecord: async (req: Request, res: Response, next: NextFunction) => {
         // >>> TODO: Thêm validation cho req.body <<<
        try {
            const deviceId = parseInt(req.params.deviceId, 10);
            if (isNaN(deviceId)) {
                 throw new ApiError(400, 'ID thiết bị không hợp lệ');
            }
            const recordData = { ...req.body, deviceId };
            const newRecord = await inspectionRecordService.createInspectionRecord(recordData);
            res.status(201).json(newRecord);
        } catch (error) {
            next(error);
        }
    },

    // GET /devices/:deviceId/inspections
    getInspectionRecordsForDevice: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const deviceId = parseInt(req.params.deviceId, 10);
            if (isNaN(deviceId)) {
                 throw new ApiError(400, 'ID thiết bị không hợp lệ');
            }
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
            const result = await inspectionRecordService.getInspectionRecordsByDeviceId(deviceId, options);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

     // GET /devices/:deviceId/inspections/latest
    getLatestInspectionRecordForDevice: async (req: Request, res: Response, next: NextFunction) => {
         try {
            const deviceId = parseInt(req.params.deviceId, 10);
             if (isNaN(deviceId)) {
                 throw new ApiError(400, 'ID thiết bị không hợp lệ');
            }
            const latestRecord = await inspectionRecordService.getLatestInspectionRecordByDeviceId(deviceId);
             if (!latestRecord) {
                throw new ApiError(404, 'Không tìm thấy bản ghi kiểm định nào cho thiết bị này');
            }
            res.status(200).json(latestRecord);
        } catch (error) {
            next(error);
        }
    },

    // GET /inspections/:id (Route không lồng)
    getInspectionRecordById: async (req: Request, res: Response, next: NextFunction) => {
        try {
             const id = parseInt(req.params.id, 10);
              if (isNaN(id)) {
                 throw new ApiError(400, 'ID bản ghi kiểm định không hợp lệ');
             }
            const record = await inspectionRecordService.getInspectionRecordById(id);
            if (!record) {
                throw new ApiError(404, 'Không tìm thấy bản ghi kiểm định');
            }
            res.status(200).json(record);
        } catch (error) {
            next(error);
        }
    },

    // PUT /inspections/:id (Route không lồng)
    updateInspectionRecord: async (req: Request, res: Response, next: NextFunction) => {
         // >>> TODO: Thêm validation cho req.body <<<
        try {
             const id = parseInt(req.params.id, 10);
             if (isNaN(id)) {
                 throw new ApiError(400, 'ID bản ghi kiểm định không hợp lệ');
             }
             const { deviceId, ...updateData } = req.body;
            const updatedRecord = await inspectionRecordService.updateInspectionRecord(id, updateData);
            res.status(200).json(updatedRecord);
        } catch (error) {
            next(error);
        }
    },

    // DELETE /inspections/:id (Route không lồng)
    deleteInspectionRecord: async (req: Request, res: Response, next: NextFunction) => {
         try {
             const id = parseInt(req.params.id, 10);
              if (isNaN(id)) {
                 throw new ApiError(400, 'ID bản ghi kiểm định không hợp lệ');
             }
            await inspectionRecordService.deleteInspectionRecord(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },
};