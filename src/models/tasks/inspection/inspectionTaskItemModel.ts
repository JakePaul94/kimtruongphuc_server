import { DataTypes, Sequelize, Model } from "sequelize";

export interface InspectionTaskItemAttributes {
  id: number;
  taskId: number;
  title: string;
  result?: string | null;
  photoUrl?: string | null;
}

export interface InspectionTaskItemInstance
  extends Model<InspectionTaskItemAttributes>,
    InspectionTaskItemAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const InspectionTaskItemModel = (sequelize: Sequelize) => {
  const InspectionTaskItem = sequelize.define<InspectionTaskItemInstance>(
    "InspectionTaskItem",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      taskId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      result: { type: DataTypes.TEXT, allowNull: true },
      photoUrl: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "inspection_task_items",
      timestamps: true,
    }
  );

  (InspectionTaskItem as any).associate = (models: any) => {
    InspectionTaskItem.belongsTo(models.InspectionTask, {
      foreignKey: "taskId",
      as: "task",
      onDelete: "CASCADE",
    });
  };

  return InspectionTaskItem;
};

export default InspectionTaskItemModel;
