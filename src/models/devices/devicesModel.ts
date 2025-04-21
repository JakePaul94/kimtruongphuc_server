import { DataTypes, Model, Sequelize } from "sequelize";

export interface DeviceAttributes {
  id?: number;
  deviceCode: string;
  deviceName: string;
  parentId?: number | null;
  model?: string;
  brand?: string;
  origin?: string;
  yearOfManufacture?: number;
  serialNumber?: string;
  usageStatus?: string;
  installationDate?: Date;
  warrantyExpiration?: Date;
  imageUrl: string;
  location?: string;
  value?: number;
  department?: string;
  manager?: string;
  maintenanceCycle?: string;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  operatingHours?: number;
  maintenanceHistory?: string;
  depreciationValue?: number;
  lastChecked?: Date;
  isUnderWarranty?: boolean;
  locationDetails?: string;
  isNeedMaintenance?: boolean;
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
  inspectionHistory?: string;
  inspectionStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeviceInstance
  extends Model<DeviceAttributes>,
  DeviceAttributes { }

const DeviceModel = (sequelize: Sequelize) => {
  const Device = sequelize.define<DeviceInstance>(
    "Device",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      deviceCode: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      deviceName: { type: DataTypes.STRING(255), allowNull: false },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "devices", key: "id" },
        onDelete: "SET NULL",
      },
      model: { type: DataTypes.STRING(100), allowNull: true },
      brand: { type: DataTypes.STRING(100), allowNull: true },
      origin: { type: DataTypes.STRING(100), allowNull: true },
      imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      yearOfManufacture: { type: DataTypes.INTEGER, allowNull: true },
      serialNumber: { type: DataTypes.STRING(100), allowNull: true },
      usageStatus: { type: DataTypes.STRING(100), allowNull: true },
      installationDate: { type: DataTypes.DATE, allowNull: true },
      warrantyExpiration: { type: DataTypes.DATE, allowNull: true },
      location: { type: DataTypes.STRING(255), allowNull: true },
      value: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      department: { type: DataTypes.STRING(100), allowNull: true },
      manager: { type: DataTypes.STRING(100), allowNull: true },
      maintenanceCycle: { type: DataTypes.STRING(100), allowNull: true },
      lastMaintenanceDate: { type: DataTypes.DATE, allowNull: true },
      nextMaintenanceDate: { type: DataTypes.DATE, allowNull: true },
      operatingHours: { type: DataTypes.INTEGER, allowNull: true },
      maintenanceHistory: { type: DataTypes.TEXT, allowNull: true },
      depreciationValue: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      lastChecked: { type: DataTypes.DATE, allowNull: true },
      isUnderWarranty: { type: DataTypes.BOOLEAN, defaultValue: true },
      locationDetails: { type: DataTypes.STRING(255), allowNull: true },
      isNeedMaintenance: { type: DataTypes.BOOLEAN, defaultValue: false },
      lastInspectionDate: { type: DataTypes.DATE, allowNull: true },
      nextInspectionDate: { type: DataTypes.DATE, allowNull: true },
      inspectionHistory: { type: DataTypes.TEXT, allowNull: true },
      inspectionStatus: { type: DataTypes.STRING(50), allowNull: true },
    },
    {
      tableName: "devices",
      timestamps: true,
      underscored: true,
    }
  );

  (Device as any).associate = (models: any) => {

    Device.hasMany(models.Device, {
      foreignKey: "parentId",
      as: "subDevices",
    });

    Device.belongsTo(models.Device, {
      foreignKey: "parentId",
      as: "parentDevice",
    });

    Device.hasMany(models.MaintenanceTask, {
      foreignKey: "deviceId",
      as: "maintenanceTasks",
    });

    Device.hasMany(models.InspectionTask, {
      foreignKey: "deviceId",
      as: "inspectionTasks",
    });

    Device.hasMany(models.DeviceDocument, {
      foreignKey: "deviceId",
      as: "documents",
    }); 
    Device.belongsToMany(models.Boiler, {
      through: models.BoilerDevice, // Sử dụng model BoilerDevice làm bảng trung gian
      as: 'boilers',               // Alias để truy cập các boilers liên quan đến device
      foreignKey: 'deviceId',      // Foreign key trong bảng BoilerDevice trỏ đến Device
      otherKey: 'boilerId',        // Foreign key trong bảng BoilerDevice trỏ đến Boiler
    });

    // Thêm association hasMany với BoilerDevice để có thể include nó trực tiếp
    Device.hasMany(models.BoilerDevice, {
      foreignKey: 'deviceId',
      as: 'boilerDevices',
    });
  };

  return Device;
};

export default DeviceModel;
