import { DataTypes, Model, Sequelize, Optional, ModelStatic } from "sequelize";

export interface MaintenanceTaskAttributes {
  id: number;
  deviceId: number;
  templateId?: number | null;
  assignedTo?: number | null;
  createdBy: number;
  scheduledDate: Date;
  completedAt?: Date | null;
  notes?: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

export interface MaintenanceTaskCreationAttributes
  extends Optional<
    MaintenanceTaskAttributes,
    "id" | "templateId" | "assignedTo" | "completedAt" | "notes" | "status"
  > {}

export interface MaintenanceTaskInstance
  extends Model<MaintenanceTaskAttributes, MaintenanceTaskCreationAttributes>,
    MaintenanceTaskAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const MaintenanceTaskModel = (sequelize: Sequelize) => {
  const MaintenanceTask = sequelize.define<MaintenanceTaskInstance>(
    "MaintenanceTask",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      deviceId: { type: DataTypes.INTEGER, allowNull: false },
      templateId: { type: DataTypes.INTEGER, allowNull: true },
      assignedTo: { type: DataTypes.INTEGER, allowNull: true },
      createdBy: { type: DataTypes.INTEGER, allowNull: false },
      scheduledDate: { type: DataTypes.DATE, allowNull: false },
      completedAt: { type: DataTypes.DATE, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM("pending", "in_progress", "completed", "cancelled"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "maintenance_tasks",
      timestamps: true,
    }
  );

  (MaintenanceTask as any).associate = (models: {
    MaintenanceTaskItem: ModelStatic<Model>;
    Device: ModelStatic<Model>;
    User: ModelStatic<Model>;
  }) => {
    MaintenanceTask.hasMany(models.MaintenanceTaskItem, {
      foreignKey: "taskId",
      as: "items",
      onDelete: "CASCADE",
    });

    MaintenanceTask.belongsTo(models.Device, { foreignKey: "deviceId", as: "device" });
    MaintenanceTask.belongsTo(models.User, { foreignKey: "assignedTo", as: "assignee" });
    MaintenanceTask.belongsTo(models.User, { foreignKey: "createdBy", as: "creator" });
  };

  return MaintenanceTask;
};

export default MaintenanceTaskModel;
