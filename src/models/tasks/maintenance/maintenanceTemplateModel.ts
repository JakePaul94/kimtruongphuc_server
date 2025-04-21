import {
    DataTypes,
    Sequelize,
    Model,
    Optional,
    ModelStatic,
  } from "sequelize";
  
  // 1. Attributes
  export interface MaintenanceTemplateAttributes {
    id: number;
    title: string;
    description?: string | null;
  }
  
  // 2. CreationAttributes
  export interface MaintenanceTemplateCreationAttributes
    extends Optional<MaintenanceTemplateAttributes, "id" | "description"> {}
  
  // 3. Instance
  export interface MaintenanceTemplateInstance
    extends Model<MaintenanceTemplateAttributes, MaintenanceTemplateCreationAttributes>,
      MaintenanceTemplateAttributes {
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // 4. Define model
  const MaintenanceTemplateModel = (sequelize: Sequelize) => {
    const MaintenanceTemplate = sequelize.define<MaintenanceTemplateInstance>(
      "MaintenanceTemplate",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        tableName: "maintenance_templates",
        timestamps: true,
      }
    );
  
    (MaintenanceTemplate as any).associate = (models: {
      MaintenanceTemplateItem: ModelStatic<Model>;
    }) => {
      MaintenanceTemplate.hasMany(models.MaintenanceTemplateItem, {
        foreignKey: "templateId",
        as: "items",
        onDelete: "CASCADE",
      });
    };
  
    return MaintenanceTemplate;
  };
  
  export default MaintenanceTemplateModel;
  