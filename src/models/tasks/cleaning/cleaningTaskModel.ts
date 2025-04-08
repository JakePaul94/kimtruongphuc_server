import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export interface CleaningTaskAttributes {
  id: number;
  templateId: number;
  boilerId: number;
  assignedUserId?: number | null;
  status: string;
  scheduledDate: Date;
  completedAt?: Date | null;
}

export interface CleaningTaskInstance
  extends Model<CleaningTaskAttributes>,
    CleaningTaskAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const CleaningTaskModel = (sequelize: Sequelize) => {
  const CleaningTask = sequelize.define<CleaningTaskInstance>(
    "CleaningTask",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      templateId: { type: DataTypes.INTEGER, allowNull: false },
      boilerId: { type: DataTypes.INTEGER, allowNull: false },
      assignedUserId: { type: DataTypes.INTEGER, allowNull: true },
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
      foreignKey: "assignedUserId",
      as: "assignedUser",
    });
  };

  return CleaningTask;
};

export default CleaningTaskModel;
