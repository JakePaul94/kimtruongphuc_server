import { DataTypes, Sequelize, Model, ModelStatic } from "sequelize";

export interface CleaningTemplateAttributes {
  id: number;
  boilerId: number;
  name: string;
  description?: string | null;
}

export interface CleaningTemplateInstance
  extends Model<CleaningTemplateAttributes>,
    CleaningTemplateAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const CleaningTemplateModel = (sequelize: Sequelize) => {
  const CleaningTemplate = sequelize.define<CleaningTemplateInstance>(
    "CleaningTemplate",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      boilerId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "cleaning_templates",
      timestamps: true,
    }
  );

  (CleaningTemplate as any).associate = (models: {
    Boiler: ModelStatic<Model>;
  }) => {
    CleaningTemplate.belongsTo(models.Boiler, {
      foreignKey: "boilerId",
      as: "boiler",
    });
  };

  return CleaningTemplate;
};

export default CleaningTemplateModel;
