import { Router } from 'express';
import { deviceController } from '../controllers/device/deviceController';
import { maintenanceRecordController } from '../controllers/device/maintenanceRecordController';
import { inspectionRecordController } from '../controllers/device/inspectionRecordController';
import { requireRole } from '../middlewares/requireRoleMiddleware';


const router = Router();


router.post('/devices', requireRole('admin'), deviceController.createDevice); // Chỉ admin được tạo?
router.get('/devices', deviceController.getAllDevices);
router.get('/devices/:id', deviceController.getDeviceById);
router.put('/devices/:id', requireRole('admin'), deviceController.updateDevice); // Chỉ admin được sửa?
router.delete('/devices/:id', requireRole('admin'), deviceController.deleteDevice); // Chỉ admin được xóa?
router.get('/devices/:id/subDevices', deviceController.getSubDevices); // Lấy thiết bị con

// ----- Maintenance Record Routes -----
// >>> TODO: Áp dụng middleware xác thực/ủy quyền nếu cần <<<
router.post('/devices/:deviceId/maintenance', maintenanceRecordController.createMaintenanceRecord);
router.get('/devices/:deviceId/maintenance', maintenanceRecordController.getMaintenanceRecordsForDevice);
router.get('/devices/:deviceId/maintenance/latest', maintenanceRecordController.getLatestMaintenanceRecordForDevice);

// Route không lồng cho maintenance records (dùng ID của chính record)
router.get('/maintenance/:id', maintenanceRecordController.getMaintenanceRecordById);
router.put('/maintenance/:id', maintenanceRecordController.updateMaintenanceRecord);
router.delete('/maintenance/:id', maintenanceRecordController.deleteMaintenanceRecord);


// ----- Inspection Record Routes -----
// >>> TODO: Áp dụng middleware xác thực/ủy quyền nếu cần <<<
router.post('/devices/:deviceId/inspections', inspectionRecordController.createInspectionRecord);
router.get('/devices/:deviceId/inspections', inspectionRecordController.getInspectionRecordsForDevice);
router.get('/devices/:deviceId/inspections/latest', inspectionRecordController.getLatestInspectionRecordForDevice);

// Route không lồng cho inspection records (dùng ID của chính record)
router.get('/inspections/:id', inspectionRecordController.getInspectionRecordById);
router.put('/inspections/:id', inspectionRecordController.updateInspectionRecord);
router.delete('/inspections/:id', inspectionRecordController.deleteInspectionRecord);


export default router; // Export router để sử dụng trong file app chính