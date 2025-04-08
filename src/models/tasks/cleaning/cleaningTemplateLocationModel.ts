import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export interface CleaningTemplateLocationAttributes {
  id: number;
  templateId: number;
  name: string;
  instructions?: string | null;
  exampleImageUrl?: string | null;
}

export interface CleaningTemplateLocationInstance
  extends Model<CleaningTemplateLocationAttributes>,
    CleaningTemplateLocationAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const CleaningTemplateLocationModel = (sequelize: Sequelize) => {
  const CleaningTemplateLocation = sequelize.define<CleaningTemplateLocationInstance>(
    "CleaningTemplateLocation",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      templateId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      instructions: { type: DataTypes.TEXT, allowNull: true },
      exampleImageUrl: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "cleaning_template_locations",
      timestamps: true,
    }
  );

  (CleaningTemplateLocation as any).associate = (models: {
    CleaningTemplate: ModelStatic<Model>;
  }) => {
    CleaningTemplateLocation.belongsTo(models.CleaningTemplate, {
      foreignKey: "templateId",
      as: "template",
    });
  };

  return CleaningTemplateLocation;
};

export default CleaningTemplateLocationModel;
