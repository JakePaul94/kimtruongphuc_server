import { DataTypes, Model, Sequelize } from "sequelize";

export interface InspectionRecordAttributes {
  id?: number; // Khóa chính, tự tăng
  deviceId: number; // ID của thiết bị (liên kết với bảng Devices)
  performedAt: Date; // Ngày thực hiện kiểm định
  description: string; // Mô tả công việc kiểm định
  inspector: string; // Tên người kiểm định
  result?: string; // Kết quả kiểm định (ví dụ: đạt, không đạt, cần bảo trì, v.v.)
  createdAt?: Date; // Thời gian tạo bản ghi
  updatedAt?: Date; // Thời gian cập nhật bản ghi
}

export interface InspectionRecordInstance
  extends Model<InspectionRecordAttributes>,
    InspectionRecordAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const InspectionRecordModel = (sequelize: Sequelize) => {
  const InspectionRecord = sequelize.define<InspectionRecordInstance>(
    "InspectionRecord",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // Khóa chính tự tăng
      deviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "devices", key: "id" },
        onDelete: "CASCADE",
      },
      performedAt: { type: DataTypes.DATE, allowNull: false }, // Ngày thực hiện kiểm định
      description: { type: DataTypes.TEXT, allowNull: false }, // Mô tả công việc kiểm định
      inspector: { type: DataTypes.STRING(100), allowNull: false }, // Tên người kiểm định
      result: { type: DataTypes.STRING(255) }, // Kết quả kiểm định
    },
    {
      tableName: "inspection_records",
      timestamps: true, // Sử dụng timestamps để tự động tạo createdAt và updatedAt
      underscored: true,
    }
  );
  
  (InspectionRecord as any).associate = (models: any) => {
    InspectionRecord.belongsTo(models.Device, {
      foreignKey: "deviceId",
      as: "device",
    });
  };

  return InspectionRecord;
};

export default InspectionRecordModel;
