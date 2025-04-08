import {
    DataTypes,
    Model,
    Sequelize,
    Optional,
    ModelStatic,
  } from "sequelize";
  
  // 1. Attributes
  export interface MaintenanceTaskAttributes {
    id: number;
    deviceId: number;
    templateId?: number | null;
    assignedTo?: number | null;
    scheduledDate: Date;
    completedAt?: Date | null;
    notes?: string | null;
    status: "pending" | "in_progress" | "completed" | "cancelled";
  }
  
  // 2. CreationAttributes
  export interface MaintenanceTaskCreationAttributes
    extends Optional<MaintenanceTaskAttributes, "id" | "templateId" | "assignedTo" | "completedAt" | "notes" | "status"> {}
  
  // 3. Instance
  export interface MaintenanceTaskInstance
    extends Model<MaintenanceTaskAttributes, MaintenanceTaskCreationAttributes>,
      MaintenanceTaskAttributes {
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // 4. Model define function
  const MaintenanceTaskModel = (sequelize: Sequelize) => {
    const MaintenanceTask = sequelize.define<MaintenanceTaskInstance>(
      "MaintenanceTask",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        deviceId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        templateId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        assignedTo: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        scheduledDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        completedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("pending", "in_progress", "completed", "cancelled"),
          defaultValue: "pending",
        },
      },
      {
        tableName: "maintenanceTasks",
        timestamps: true,
      }
    );
  
    (MaintenanceTask as any).associate = (models: {
      MaintenanceTaskItem: ModelStatic<Model>;
      Device: ModelStatic<Model>;
    }) => {
      MaintenanceTask.hasMany(models.MaintenanceTaskItem, {
        foreignKey: "taskId",
        as: "items",
        onDelete: "CASCADE",
      });
  
      MaintenanceTask.belongsTo(models.Device, {
        foreignKey: "deviceId",
        as: "device",
      });
    };
  
    return MaintenanceTask;
  };
  
  export default MaintenanceTaskModel;
  