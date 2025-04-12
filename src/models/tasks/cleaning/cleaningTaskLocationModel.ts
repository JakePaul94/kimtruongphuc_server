import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";

export interface CleaningTaskLocationAttributes {
  id: number;
  taskId: number;
  templateLocationId: number;
  photoUrl: string | null;
  notes?: string | null;
  completedAt?: Date | null;
}

// Khai báo các trường có thể bỏ qua khi tạo bản ghi
export interface CleaningTaskLocationCreationAttributes
  extends Optional<
    CleaningTaskLocationAttributes,
    'id' | 'photoUrl' | 'notes' | 'completedAt'
  > {}

export interface CleaningTaskLocationInstance
  extends Model<
    CleaningTaskLocationAttributes,
    CleaningTaskLocationCreationAttributes
  >,
    CleaningTaskLocationAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const CleaningTaskLocationModel = (sequelize: Sequelize) => {
  const CleaningTaskLocation = sequelize.define<CleaningTaskLocationInstance>(
    "CleaningTaskLocation",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      taskId: { type: DataTypes.INTEGER, allowNull: false },
      templateLocationId: { type: DataTypes.INTEGER, allowNull: false },
      photoUrl: { type: DataTypes.STRING, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      completedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "cleaning_task_locations",
      timestamps: true,
    }
  );

  (CleaningTaskLocation as any).associate = (models: {
    CleaningTask: ModelStatic<Model>;
    CleaningTemplateLocation: ModelStatic<Model>;
  }) => {
    CleaningTaskLocation.belongsTo(models.CleaningTask, {
      foreignKey: "taskId",
      as: "task",
    });
    CleaningTaskLocation.belongsTo(models.CleaningTemplateLocation, {
      foreignKey: "templateLocationId",
      as: "templateLocation",
    });
  };

  return CleaningTaskLocation;
};

export default CleaningTaskLocationModel;
