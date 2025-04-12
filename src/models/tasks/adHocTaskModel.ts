import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  ModelStatic,
} from "sequelize";
import { TaskStatusType } from "../../types/taskStatusType";

// 1. Attributes
export interface AdHocTaskAttributes {
  id: number;
  deviceId: number;
  boilerId?: number | null;
  assignedTo?: number | null;
  createdBy: number;
  title: string;
  description?: string | null;
  scheduledDate: Date;
  status: TaskStatusType;
}

// 2. CreationAttributes
export interface AdHocTaskCreationAttributes
  extends Optional<
    AdHocTaskAttributes,
    "id" | "description" | "status" | "assignedTo" | "boilerId"
  > {}

// 3. Instance
export interface AdHocTaskInstance
  extends Model<AdHocTaskAttributes, AdHocTaskCreationAttributes>,
    AdHocTaskAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

// 4. Model
const AdHocTaskModel = (sequelize: Sequelize) => {
  const AdHocTask = sequelize.define<AdHocTaskInstance>(
    "AdHocTask",
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
      boilerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      scheduledDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_process', 'completed', 'canceled'),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      tableName: "ad_hoc_tasks",
      timestamps: true,
    }
  );

  (AdHocTask as any).associate = (models: {
    Device: ModelStatic<Model>;
    User: ModelStatic<Model>;
    Boiler: ModelStatic<Model>;
    AdHocTaskLog: ModelStatic<Model>;
  }) => {
    AdHocTask.belongsTo(models.Device, {
      foreignKey: "deviceId",
      as: "device",
    });

    AdHocTask.belongsTo(models.Boiler, {
      foreignKey: "boilerId",
      as: "boiler",
    });

    AdHocTask.belongsTo(models.User, {
      foreignKey: "assignedTo",
      as: "assignedToUser", // đổi alias khác
    });

    AdHocTask.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator",
    });

    AdHocTask.hasMany(models.AdHocTaskLog, {
      foreignKey: "adHocTaskId",
      as: "logs",
      onDelete: "CASCADE",
    });
  };

  return AdHocTask;
};

export default AdHocTaskModel;
