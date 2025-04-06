import { DataTypes, Model, Sequelize } from "sequelize";

interface DeviceDocumentAttributes {
  id?: number;
  deviceId: number;
  name: string;
  fileUrl: string;
  uploadedBy?: string;
}

export interface DeviceDocumentInstance
  extends Model<DeviceDocumentAttributes>,
    DeviceDocumentAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const DeviceDocumentModel = (sequelize: Sequelize) => {
  const DeviceDocument = sequelize.define<DeviceDocumentInstance>(
    "DeviceDocument",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      deviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "devices", key: "id" },
        onDelete: "CASCADE",
      },
      name: { type: DataTypes.STRING(255), allowNull: false },
      fileUrl: { type: DataTypes.STRING(512), allowNull: false },
      uploadedBy: { type: DataTypes.STRING(100) },
    },
    {
      tableName: "device_documents",
      timestamps: true,
      underscored: true,
    }
  );(DeviceDocument as any).associate = (models: any) => {
    DeviceDocument.belongsTo(models.Device, { foreignKey: 'deviceId', as: 'device' });
  }; 
  return DeviceDocument 
};

export default DeviceDocumentModel;
