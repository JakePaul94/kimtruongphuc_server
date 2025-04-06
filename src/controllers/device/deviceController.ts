import { Request, Response, NextFunction } from 'express';
import { deviceService } from '../../services/devices/deviceService';
import { ApiError } from '../../utils/ApiError'; // Giả sử đường dẫn đúng

export const deviceController = {
    // POST /devices
    createDevice: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newDevice = await deviceService.createDevice(req.body); // Sử dụng value nếu có validation
            res.status(201).json(newDevice);
        } catch (error) {
            next(error); 
        }
    },

    // GET /devices
    getAllDevices: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Lấy các tham số phân trang, lọc, sắp xếp từ query string
            const { limit, offset, order, ...filter } = req.query;

            const limitNum = limit ? parseInt(limit as string, 10) : undefined;
            const offsetNum = offset ? parseInt(offset as string, 10) : undefined;

            // Xử lý order (ví dụ: ?order=deviceName:ASC,createdAt:DESC)
            let orderArray: Array<[string, string]> | undefined;
            if (typeof order === 'string') {
                orderArray = order.split(',').map(pair => {
                    const [field, direction = 'ASC'] = pair.split(':');
                    return [field, direction.toUpperCase()];
                }) as Array<[string, string]>;
            }

            // Xây dựng options cho service
            const options = {
                filter: filter, // Truyền các tham số lọc còn lại
                limit: limitNum,
                offset: offsetNum,
                order: orderArray,
                // Có thể thêm include từ query nếu cần
            };

            const result = await deviceService.getAllDevices(options);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

    // GET /devices/:id
    getDeviceById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                 throw new ApiError(400, 'ID thiết bị không hợp lệ');
            }
            // Có thể lấy include options từ query string nếu muốn linh hoạt
            // Ví dụ: ?include=subDevices,maintenanceRecords
            const device = await deviceService.getDeviceById(id /*, includeOptions */);
            if (!device) {
                throw new ApiError(404, 'Không tìm thấy thiết bị');
            }
            res.status(200).json(device);
        } catch (error) {
            next(error);
        }
    },

    // PUT /devices/:id  (Hoặc PATCH)
    updateDevice: async (req: Request, res: Response, next: NextFunction) => {
         // >>> TODO: Thêm validation cho req.body <<<
        try {
            const id = parseInt(req.params.id, 10);
             if (isNaN(id)) {
                 throw new ApiError(400, 'ID thiết bị không hợp lệ');
            }
            const updatedDevice = await deviceService.updateDevice(id, req.body);
            res.status(200).json(updatedDevice);
        } catch (error) {
            next(error);
        }
    },

    // DELETE /devices/:id
    deleteDevice: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id, 10);
             if (isNaN(id)) {
                 throw new ApiError(400, 'ID thiết bị không hợp lệ');
            }
            await deviceService.deleteDeviceById(id);
            res.status(204).send(); // No Content
        } catch (error) {
            next(error);
        }
    },

     // GET /devices/:id/subDevices (Ví dụ thêm)
    getSubDevices: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parentId = parseInt(req.params.id, 10);
             if (isNaN(parentId)) {
                 throw new ApiError(400, 'ID thiết bị cha không hợp lệ');
            }
            const subDevices = await deviceService.getSubDevices(parentId);
            res.status(200).json(subDevices);
        } catch (error) {
            next(error);
        }
    },
};