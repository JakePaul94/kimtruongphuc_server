import { Router } from 'express';
import { deviceController } from '../controllers/device/deviceController';
import { maintenanceRecordController } from '../controllers/device/maintenanceRecordController';
import { inspectionRecordController } from '../controllers/device/inspectionRecordController';
import { requireRole } from '../middlewares/requireRoleMiddleware';


const deviceRouter = Router();


deviceRouter.post('/devices', requireRole('admin'), deviceController.createDevice); // Chỉ admin được tạo?
deviceRouter.get('/devices', deviceController.getAllDevices);
deviceRouter.get('/devices/:id', deviceController.getDeviceById);
deviceRouter.put('/devices/:id', requireRole('admin'), deviceController.updateDevice); // Chỉ admin được sửa?
deviceRouter.delete('/devices/:id', requireRole('admin'), deviceController.deleteDevice); // Chỉ admin được xóa?
deviceRouter.get('/devices/:id/subDevices', deviceController.getSubDevices); // Lấy thiết bị con

// ----- Maintenance Record Routes -----
// >>> TODO: Áp dụng middleware xác thực/ủy quyền nếu cần <<<
deviceRouter.post('/devices/:deviceId/maintenance', maintenanceRecordController.createMaintenanceRecord);
deviceRouter.get('/devices/:deviceId/maintenance', maintenanceRecordController.getMaintenanceRecordsForDevice);
deviceRouter.get('/devices/:deviceId/maintenance/latest', maintenanceRecordController.getLatestMaintenanceRecordForDevice);

// Route không lồng cho maintenance records (dùng ID của chính record)
deviceRouter.get('/maintenance/:id', maintenanceRecordController.getMaintenanceRecordById);
deviceRouter.put('/maintenance/:id', maintenanceRecordController.updateMaintenanceRecord);
deviceRouter.delete('/maintenance/:id', maintenanceRecordController.deleteMaintenanceRecord);


// ----- Inspection Record Routes -----
// >>> TODO: Áp dụng middleware xác thực/ủy quyền nếu cần <<<
deviceRouter.post('/devices/:deviceId/inspections', inspectionRecordController.createInspectionRecord);
deviceRouter.get('/devices/:deviceId/inspections', inspectionRecordController.getInspectionRecordsForDevice);
deviceRouter.get('/devices/:deviceId/inspections/latest', inspectionRecordController.getLatestInspectionRecordForDevice);

// Route không lồng cho inspection records (dùng ID của chính record)
deviceRouter.get('/inspections/:id', inspectionRecordController.getInspectionRecordById);
deviceRouter.put('/inspections/:id', inspectionRecordController.updateInspectionRecord);
deviceRouter.delete('/inspections/:id', inspectionRecordController.deleteInspectionRecord);


export default deviceRouter; // Export router để sử dụng trong file app chính