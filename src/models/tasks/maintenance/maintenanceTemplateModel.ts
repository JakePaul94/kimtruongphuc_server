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
    name: string;
    description?: string | null;
    deviceType: string;
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
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        deviceType: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        tableName: "maintenanceTemplates",
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
  