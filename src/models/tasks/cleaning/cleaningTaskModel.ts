import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";
import { CleaningTaskLocationInstance } from "./cleaningTaskLocationModel";
import { TaskStatusType } from "../../../types/taskStatusType";

export interface CleaningTaskAttributes {
  id: number;
  templateId: number;
  boilerId: number;
  createdBy?: number;
  assignedTo?: number | null;
  status:TaskStatusType;
  scheduledDate: Date;
  completedAt?: Date | null;
}

export interface CleaningTaskCreationAttributes
  extends Optional<
    CleaningTaskAttributes,
    'id' | 'status' | 'createdBy' | 'assignedTo' | 'completedAt'
  > {}

export interface CleaningTaskInstance
  extends Model<CleaningTaskAttributes, CleaningTaskCreationAttributes>,
    CleaningTaskAttributes {
  createdAt?: Date;
  updatedAt?: Date;
  locations?: CleaningTaskLocationInstance[];
}

const CleaningTaskModel = (sequelize: Sequelize) => {
  const CleaningTask = sequelize.define<CleaningTaskInstance>(
    "CleaningTask",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      templateId: { type: DataTypes.INTEGER, allowNull: false },
      boilerId: { type: DataTypes.INTEGER, allowNull: false },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_process', 'completed', 'canceled'),
        allowNull: false,
        defaultValue: "pending",
      },
      scheduledDate: { type: DataTypes.DATEONLY, allowNull: false },
      completedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "cleaning_tasks",
      timestamps: true,
    }
  );

  (CleaningTask as any).associate = (models: {
    CleaningTemplate: ModelStatic<Model>;
    Boiler: ModelStatic<Model>;
    User: ModelStatic<Model>;
    CleaningTaskLocation: ModelStatic<Model>;
  }) => {
    CleaningTask.belongsTo(models.CleaningTemplate, {
      foreignKey: "templateId",
      as: "template",
    });
    CleaningTask.belongsTo(models.Boiler, {
      foreignKey: "boilerId",
      as: "boiler",
    });
    CleaningTask.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator",
    });
    CleaningTask.belongsTo(models.User, {
      foreignKey: "assignedTo",
      as: "assignedUser",
    });
    CleaningTask.hasMany(models.CleaningTaskLocation, {
      foreignKey: "taskId",
      as: "locations",
      onDelete: "CASCADE",
    });
  };

  return CleaningTask;
};

export default CleaningTaskModel;
