import { DataTypes, Model, Sequelize } from 'sequelize';

export interface DeviceAttributes {
  id?: number;
  deviceCode: string; // Mã thiết bị
  deviceName: string; // Tên thiết bị
  parentId?: number | null; // ID thiết bị cha (nếu có)
  model?: string; // Mẫu mã
  brand?: string; // Thương hiệu
  origin?: string; // Xuất xứ
  yearOfManufacture?: number; // Năm sản xuất
  serialNumber?: string; // Số serial
  usageStatus?: string; // Tình trạng sử dụng
  installationDate?: Date; // Ngày lắp đặt
  warrantyExpiration?: Date; // Ngày hết bảo hành
  location?: string; // Vị trí đặt
  value?: number; // Giá trị thiết bị
  department?: string; // Phòng ban sử dụng
  manager?: string; // Người quản lý
  maintenanceCycle?: string; // Chu kỳ bảo trì (theo thời gian hoặc số giờ hoạt động)
  lastMaintenanceDate?: Date; // Ngày bảo trì gần nhất
  nextMaintenanceDate?: Date; // Ngày bảo trì tiếp theo
  operatingHours?: number; // Số giờ hoạt động
  maintenanceHistory?: string; // Lịch sử bảo trì
  depreciationValue?: number; // Giá trị khấu hao
  lastChecked?: Date; // Ngày kiểm tra gần nhất
  isUnderWarranty?: boolean; // Còn trong thời gian bảo hành
  locationDetails?: string; // Chi tiết vị trí
  isNeedMaintenance?: boolean; // Cần bảo trì hay không
  lastInspectionDate?: Date; // Ngày kiểm định gần nhất
  nextInspectionDate?: Date; // Ngày kiểm định tiếp theo
  inspectionHistory?: string; // Lịch sử kiểm định
  inspectionStatus?: string; // Trạng thái kiểm định (Đạt, Không đạt)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeviceInstance extends Model<DeviceAttributes>, DeviceAttributes {}

const DeviceModel = (sequelize: Sequelize) => {
  const Device = sequelize.define<DeviceInstance>('Device', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    deviceCode: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    deviceName: { type: DataTypes.STRING(255), allowNull: false },
    parentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'devices', key: 'id' }, onDelete: 'SET NULL' },
    model: { type: DataTypes.STRING(100), allowNull: true },
    brand: { type: DataTypes.STRING(100), allowNull: true },
    origin: { type: DataTypes.STRING(100), allowNull: true },
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
  }, {
    tableName: 'devices',
    timestamps: true,
    underscored: true,
  });

  (Device as any).associate = (models: any) => {
    Device.hasMany(models.Device, { foreignKey: 'parentId', as: 'subDevices' });
    Device.belongsTo(models.Device, { foreignKey: 'parentId', as: 'parentDevice' });
    Device.hasMany(models.MaintenanceRecord, { foreignKey: 'deviceId', as: 'maintenanceRecords' });
    Device.hasMany(models.InspectionRecord, { foreignKey: 'deviceId', as: 'inspectionRecords' });
    Device.hasMany(models.DeviceDocument, { foreignKey: 'deviceId', as: 'documents' });
  };

  return Device;
};

export default DeviceModel;
