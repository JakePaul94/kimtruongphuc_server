import cron from 'node-cron';
import { CleaningTemplateInstance } from "../models/tasks/cleaning/cleaningTemplateModel";
import cleaningService from "../services/task/cleaningService";
import waterReportService from "../services/task/waterReportService";
import { formatDateToYYYYMMDD } from "../utils/timeHelpers";
import { deviceService } from '../services/devices/deviceService';
import maintenanceService from '../services/task/maintenanceService';

const createTaskEveryDay = async () => {
    const cleaningTemplates: CleaningTemplateInstance[] = await cleaningService.getAllTemplates();
    const waterReportTemplates = await waterReportService.getAllTemplates();
    const todayDate = Date.now();
    const today = formatDateToYYYYMMDD(new Date(todayDate));
    const devices = await deviceService.getAllDevices()
    const fifteenDaysFromNow = new Date();
    //  fifteenDaysFromNow.setDate(new Date(todayDate).getDate() + 15); // Tính ngày sau 15 ngày
    // for (let device of devices) {
    //     const nextMaintenanceDate = new Date(device.nextMaintenanceDate);
    //     const nextInspectionDate = new Date(device.nextInspectionDate);
    //     maintenanceService.createTask()
    // }
    for (let template of cleaningTemplates) {
        await cleaningService.createTask({
            boilerId: template.boilerId,
            templateId: template.id,
            scheduledDate: today,
        });
    }

    for (let template of waterReportTemplates) {
        await waterReportService.createTask({
            boilerId: template.boilerId,
            templateId: template.id,
            scheduledDate: today,
        });
    }

    console.log(`Created tasks at ${new Date().toLocaleString()}`);
};

// Chạy lúc 6h sáng mỗi ngày
cron.schedule('30 2 * * *', async () => {
    console.log("Running daily task creation at 6AM...");
    await createTaskEveryDay();
});
