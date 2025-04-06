import { DataTypes, Model, Sequelize } from "sequelize";

export interface MaintenanceRecordAttributes {
  id?: number; // Khóa chính, tự tăng
  deviceId: number; // ID của thiết bị (liên kết với bảng Devices)
  performedAt: Date; // Ngày thực hiện bảo trì
  description: string; // Mô tả công việc đã thực hiện
  technician: string; // Tên kỹ thuật viên thực hiện
  cost?: number; // Chi phí bảo trì (nếu có)
  createdAt?: Date; // Thời gian tạo bản ghi
  updatedAt?: Date; // Thời gian cập nhật bản ghi
}

export interface MaintenanceRecordInstance
  extends Model<MaintenanceRecordAttributes>,
    MaintenanceRecordAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const MaintenanceRecordModel = (sequelize: Sequelize) => {
  const MaintenanceRecord = sequelize.define<MaintenanceRecordInstance>(
    "MaintenanceRecord",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // Khóa chính tự tăng
      deviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "devices", key: "id" },
        onDelete: "CASCADE",
      },
      performedAt: { type: DataTypes.DATE, allowNull: false }, // Ngày thực hiện bảo trì
      description: { type: DataTypes.TEXT, allowNull: false }, // Mô tả công việc đã thực hiện
      technician: { type: DataTypes.STRING(100), allowNull: false }, // Tên kỹ thuật viên thực hiện
      cost: { type: DataTypes.FLOAT }, // Chi phí bảo trì (nếu có)
    },
    {
      tableName: "maintenance_records",
      timestamps: true, // Sử dụng timestamps để tự động tạo createdAt và updatedAt
      underscored: true,
    }
  );
  
  (MaintenanceRecord as any).associate = (models: any) => {
    MaintenanceRecord.belongsTo(models.Device, {
      foreignKey: "deviceId",
      as: "device",
    });
  };

  return MaintenanceRecord;
};

export default MaintenanceRecordModel;
