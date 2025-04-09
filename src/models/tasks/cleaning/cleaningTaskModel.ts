import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { CleaningTaskLocationInstance } from "./cleaningTaskLocationModel";

export interface CleaningTaskAttributes {
  id: number;
  templateId: number;
  boilerId: number;
  createdBy?: number;
  assignedUserId?: number | null;
  date: string;
  status: string;
  scheduledDate: Date;
  completedAt?: Date | null;
}

export interface CleaningTaskInstance
  extends Model<CleaningTaskAttributes>,
    CleaningTaskAttributes {
  createdAt?: Date;
  updatedAt?: Date;
  locations?: CleaningTaskLocationInstance[]; // 👈 thêm dòng này để dùng được task.locations
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
      },
      assignedUserId: { type: DataTypes.INTEGER, allowNull: true },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending", // pending | in_progress | completed
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
    CleaningTask.hasMany(models.CleaningTaskLocation, {
        foreignKey: 'taskId',
        as: 'locations',
        onDelete: 'CASCADE',
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
      foreignKey: "assignedUserId",
      as: "assignedUser",
    });
  };

  return CleaningTask;
};

export default CleaningTaskModel;
