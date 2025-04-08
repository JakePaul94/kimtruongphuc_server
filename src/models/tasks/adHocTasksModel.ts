import {
    DataTypes,
    Model,
    Optional,
    Sequelize,
    ModelStatic,
  } from "sequelize";
  
  // 1. Attributes
  export interface AdHocTaskAttributes {
    id: number;
    deviceId: number;
    assignedTo: number;
    title: string;
    description?: string | null;
    status: "pending" | "in_progress" | "done";
  }
  
  // 2. CreationAttributes
  export interface AdHocTaskCreationAttributes
    extends Optional<AdHocTaskAttributes, "id" | "description" | "status"> {}
  
  // 3. Instance
  export interface AdHocTaskInstance
    extends Model<AdHocTaskAttributes, AdHocTaskCreationAttributes>,
      AdHocTaskAttributes {
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // 4. Model
  const AdHocTaskModel = (sequelize: Sequelize) => {
    const AdHocTask = sequelize.define<AdHocTaskInstance>(
      "AdHocTask",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        deviceId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        assignedTo: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("pending", "in_progress", "done"),
          allowNull: false,
          defaultValue: "pending",
        },
      },
      {
        tableName: "ad_hoc_tasks",
        timestamps: true,
      }
    );
  
    (AdHocTask as any).associate = (models: {
      Device: ModelStatic<Model>;
      User: ModelStatic<Model>;
      AdHocTaskLog: ModelStatic<Model>;
    }) => {
      AdHocTask.belongsTo(models.Device, {
        foreignKey: "deviceId",
        as: "device",
      });
  
      AdHocTask.belongsTo(models.User, {
        foreignKey: "assignedTo",
        as: "assignedUser",
      });
  
      AdHocTask.hasMany(models.AdHocTaskLog, {
        foreignKey: "adHocTaskId",
        as: "logs",
        onDelete: "CASCADE",
      });
    };
  
    return AdHocTask;
  };
  
  export default AdHocTaskModel;
  