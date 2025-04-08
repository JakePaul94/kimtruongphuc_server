import { DataTypes, Sequelize, Model } from 'sequelize';

export interface InspectionTemplateItemAttributes {
  id: number;
  templateId: number;
  title: string;
  instruction?: string | null;
}

export interface InspectionTemplateItemInstance
  extends Model<InspectionTemplateItemAttributes>,
    InspectionTemplateItemAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const InspectionTemplateItemModel = (sequelize: Sequelize) => {
  const InspectionTemplateItem = sequelize.define<InspectionTemplateItemInstance>(
    'InspectionTemplateItem',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      templateId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      instruction: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 'inspection_template_items',
      timestamps: true,
    }
  );

  (InspectionTemplateItem as any).associate = (models: any) => {
    InspectionTemplateItem.belongsTo(models.InspectionTemplate, {
      foreignKey: 'templateId',
      as: 'template',
    });
  };

  return InspectionTemplateItem;
};

export default InspectionTemplateItemModel;
