import { DataTypes, Sequelize, Model, ModelStatic } from 'sequelize';
import { InspectionTaskItemInstance } from './inspectionTaskItemModel';

export interface InspectionTaskAttributes {
  id: number;
  deviceId: number;
  templateId?: number | null;
  assignedTo?: number | null;
  status: string; // 'pending' | 'in_progress' | 'completed'
  scheduledDate: Date;
  completedAt?: Date | null;
}

export interface InspectionTaskInstance extends Model<InspectionTaskAttributes>, InspectionTaskAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const InspectionTaskModel = (sequelize: Sequelize) => {
  const InspectionTask = sequelize.define<InspectionTaskInstance>(
    'InspectionTask',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      deviceId: { type: DataTypes.INTEGER, allowNull: false },
      templateId: { type: DataTypes.INTEGER, allowNull: true },
      assignedTo: { type: DataTypes.INTEGER, allowNull: true },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
      scheduledDate: { type: DataTypes.DATE, allowNull: false },
      completedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'inspection_tasks',
      timestamps: true,
    }
  );

  (InspectionTask as any).associate = (models: {
    InspectionTaskItem: ModelStatic<Model>;
    User: ModelStatic<Model>;
    Device: ModelStatic<Model>;
    InspectionTemplate: ModelStatic<Model>;
  }) => {
    InspectionTask.hasMany(models.InspectionTaskItem, {
      foreignKey: 'taskId',
      as: 'items',
      onDelete: 'CASCADE',
    });

    InspectionTask.belongsTo(models.User, {
      foreignKey: 'assignedTo',
      as: 'assignee',
    });

    InspectionTask.belongsTo(models.Device, {
      foreignKey: 'deviceId',
      as: 'device',
    });

    InspectionTask.belongsTo(models.InspectionTemplate, {
      foreignKey: 'templateId',
      as: 'template',
    });
  };

  return InspectionTask;
};

export default InspectionTaskModel;
