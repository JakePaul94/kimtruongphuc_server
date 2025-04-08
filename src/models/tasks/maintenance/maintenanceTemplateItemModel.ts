import {
    DataTypes,
    Model,
    Sequelize,
    Optional,
    ModelStatic,
  } from "sequelize";
  
  // 1. Attributes
  export interface MaintenanceTemplateItemAttributes {
    id: number;
    templateId: number;
    title: string;
    instruction?: string | null;
  }
  
  // 2. CreationAttributes
  export interface MaintenanceTemplateItemCreationAttributes
    extends Optional<MaintenanceTemplateItemAttributes, "id" | "instruction"> {}
  
  // 3. Instance
  export interface MaintenanceTemplateItemInstance
    extends Model<MaintenanceTemplateItemAttributes, MaintenanceTemplateItemCreationAttributes>,
      MaintenanceTemplateItemAttributes {
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // 4. Model define function
  const MaintenanceTemplateItemModel = (sequelize: Sequelize) => {
    const MaintenanceTemplateItem = sequelize.define<MaintenanceTemplateItemInstance>(
      "MaintenanceTemplateItem",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        templateId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        instruction: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        tableName: "maintenanceTemplateItems",
        timestamps: true,
      }
    );
  
    (MaintenanceTemplateItem as any).associate = (models: {
      MaintenanceTemplate: ModelStatic<Model>;
    }) => {
      MaintenanceTemplateItem.belongsTo(models.MaintenanceTemplate, {
        foreignKey: "templateId",
        as: "template",
      });
    };
  
    return MaintenanceTemplateItem;
  };
  
  export default MaintenanceTemplateItemModel;
  