import { DataTypes, Sequelize, Model, ModelStatic } from 'sequelize';

export interface InspectionTemplateAttributes {
  id: number;
  title: string;
  description?: string | null;
}

export interface InspectionTemplateInstance
  extends Model<InspectionTemplateAttributes>,
    InspectionTemplateAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const InspectionTemplateModel = (sequelize: Sequelize) => {
  const InspectionTemplate = sequelize.define<InspectionTemplateInstance>(
    'InspectionTemplate',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'inspection_templates',
      timestamps: true,
    }
  );

  (InspectionTemplate as any).associate = (models: {
    InspectionTemplateItem: ModelStatic<Model>;
  }) => {
    InspectionTemplate.hasMany(models.InspectionTemplateItem, {
      foreignKey: 'templateId',
      as: 'items',
      onDelete: 'CASCADE',
    });
  };

  return InspectionTemplate;
};

export default InspectionTemplateModel;
