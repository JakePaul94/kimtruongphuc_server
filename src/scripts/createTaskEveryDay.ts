import { CleaningTaskAttributes, CleaningTaskInstance } from "../models/tasks/cleaning/cleaningTaskModel"
import { CleaningTemplateInstance } from "../models/tasks/cleaning/cleaningTemplateModel"
import cleaningService from "../services/task/cleaningService"
import waterReportService from "../services/task/waterReportService"
import { formatDateToYYYYMMDD } from "../utils/timeHelpers"





const createTaskEveryDay = async () => {
    const cleaningTemplates: CleaningTemplateInstance[] = await cleaningService.getAllTemplates()
    const waterReportTemplates = await waterReportService.getAllTemplates()
    const todayDate = Date.now()
    const today = formatDateToYYYYMMDD(new Date(todayDate))
    for (let i = 0; i < cleaningTemplates.length; i++) {
        const template = cleaningTemplates[i];
        const taskForToday = await cleaningService.createTask({ boilerId: template.boilerId, templateId: template.id, scheduledDate:today})
    }
    for (let i = 0; i < waterReportTemplates.length; i++) {
        const template = waterReportTemplates[i];
        const taskForToday = await waterReportService.createTask({ boilerId: template.boilerId, templateId: template.id, scheduledDate:today})
    }
}
createTaskEveryDay()
