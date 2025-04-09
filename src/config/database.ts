import { Sequelize } from "sequelize";
import dotenv from "dotenv";

import UserModel from "../models/userModel";
import RefreshTokenModel from "../models/refreshTokenModel";
import LoginHistoryModel from "../models/loginHistoryModel";

// Devices
import DeviceModel from "../models/devices/devicesModel";
import DeviceDocumentModel from "../models/devices/deviceDocumentModel";


// Boilers
import BoilerModel from "../models/boilers/boilerModel";
import BoilerUserModel from "../models/boilers/boilerUserModel";
import BoilerDeviceModel from "../models/boilers/boilerDeviceModel";

// Tasks
import CleaningTemplateModel from "../models/tasks/cleaning/cleaningTemplateModel";
import CleaningTemplateLocationModel from "../models/tasks/cleaning/cleaningTemplateLocationModel";
import CleaningTaskModel from "../models/tasks/cleaning/cleaningTaskModel";
import CleaningTaskLocationModel from "../models/tasks/cleaning/cleaningTaskLocationModel";

import InspectionTemplateModel from "../models/tasks/inspection/inspectionTemplatesModel";
import InspectionTemplateItemModel from "../models/tasks/inspection/inspectionTemplateItemModel"
import InspectionTaskModel from "../models/tasks/inspection/inspectionTaskModel";
import InspectionTaskItemModel from "../models/tasks/inspection/inspectionTaskItemModel";


import MaintenanceTemplateModel from "../models/tasks/maintenance/maintenanceTemplateModel";
import MaintenanceTemplateItemModel from "../models/tasks/maintenance/maintenanceTemplateItemModel";
import MaintenanceTaskModel from "../models/tasks/maintenance/maintenanceTaskModel";
import MaintenanceTaskItemModel from "../models/tasks/maintenance/maintenanceTaskItemModel";

import AdHocTaskModel from "../models/tasks/adHocTaskModel";
import AdHocTaskLogModel from "../models/tasks/adHocTaskLogsModel";

import IncidentReportModel from "../models/tasks/incidentReportsModel";
import IncidentReportPhotoModel from "../models/tasks/incidentReportPhotosModel";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    logging: console.log,
  }
);

const models = {
  User: UserModel(sequelize),
  LoginHistory: LoginHistoryModel(sequelize),
  RefreshToken: RefreshTokenModel(sequelize),

  // Device
  Device: DeviceModel(sequelize),
  DeviceDocument: DeviceDocumentModel(sequelize),
  IncidentReport: IncidentReportModel(sequelize),
  IncidentReportPhoto: IncidentReportPhotoModel(sequelize),

  // Boiler
  Boiler: BoilerModel(sequelize),
  BoilerUser: BoilerUserModel(sequelize),
  BoilerDevice: BoilerDeviceModel(sequelize),


  // Cleaning Tasks
  CleaningTemplate: CleaningTemplateModel(sequelize),
  CleaningTemplateLocation: CleaningTemplateLocationModel(sequelize),
  CleaningTask: CleaningTaskModel(sequelize),
  CleaningTaskLocation: CleaningTaskLocationModel(sequelize),

  // Maintenance Tasks
  MaintenanceTemplate: MaintenanceTemplateModel(sequelize),
  MaintenanceTemplateItem: MaintenanceTemplateItemModel(sequelize),
  MaintenanceTask: MaintenanceTaskModel(sequelize),
  MaintenanceTaskItem: MaintenanceTaskItemModel(sequelize),

 // Inspection Tasks ✅ (Đã thêm ở đây)
 InspectionTemplate: InspectionTemplateModel(sequelize),
 InspectionTemplateItem: InspectionTemplateItemModel(sequelize),
 InspectionTask: InspectionTaskModel(sequelize),
 InspectionTaskItem: InspectionTaskItemModel(sequelize),

  // Ad-Hoc Tasks
  AdHocTask: AdHocTaskModel(sequelize),
  AdHocTaskLog: AdHocTaskLogModel(sequelize),
};

// Associate models
Object.keys(models).forEach((modelName) => {
  if ((models as any)[modelName].associate) {
    (models as any)[modelName].associate(models);
  }
});

export { sequelize, models };
