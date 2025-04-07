import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import UserModel from "../models/userModel";
import RefreshTokenModel from "../models/refreshTokenModel";
import DeviceModel from "../models/devices/devicesModel";
import DeviceDocumentModel from "../models/devices/deviceDocumentModel";
import MaintenanceRecordModel from "../models/devices/maintenanceRecordModel";
import LoginHistoryModel from "../models/loginHistoryModel";
import InspectionRecordModel from "../models/devices/inspectionRecordModel";
import TaskModel from "../models/tasks/taskModel";

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
  User: UserModel(sequelize),LoginHistory:LoginHistoryModel(sequelize),
  RefreshToken: RefreshTokenModel(sequelize),
  Device: DeviceModel(sequelize),
  DeviceDocument: DeviceDocumentModel(sequelize),
  MaintenanceRecord: MaintenanceRecordModel(sequelize), 
  InspectionRecord: InspectionRecordModel(sequelize),
  Task: TaskModel(sequelize)
};


Object.keys(models).forEach((modelName) => {
  if ((models as any)[modelName].associate) {
    (models as any)[modelName].associate(models);
  }
});

export { sequelize, models };
