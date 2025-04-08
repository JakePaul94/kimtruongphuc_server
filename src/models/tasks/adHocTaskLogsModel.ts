import {
    DataTypes,
    Model,
    Optional,
    Sequelize,
    ModelStatic,
  } from "sequelize";
  
  // 1. Attributes
  export interface AdHocTaskLogAttributes {
    id: number;
    adHocTaskId: number;
    createdBy: number;
    note?: string | null;
    photoUrl?: string | null;
  }
  
  // 2. CreationAttributes
  export interface AdHocTaskLogCreationAttributes
    extends Optional<AdHocTaskLogAttributes, "id" | "note" | "photoUrl"> {}
  
  // 3. Instance
  export interface AdHocTaskLogInstance
    extends Model<AdHocTaskLogAttributes, AdHocTaskLogCreationAttributes>,
      AdHocTaskLogAttributes {
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // 4. Model
  const AdHocTaskLogModel = (sequelize: Sequelize) => {
    const AdHocTaskLog = sequelize.define<AdHocTaskLogInstance>(
      "AdHocTaskLog",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        adHocTaskId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        note: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        photoUrl: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        tableName: "ad_hoc_task_logs",
        timestamps: true,
      }
    );
  
    (AdHocTaskLog as any).associate = (models: {
      AdHocTask: ModelStatic<Model>;
      User: ModelStatic<Model>;
    }) => {
      AdHocTaskLog.belongsTo(models.AdHocTask, {
        foreignKey: "adHocTaskId",
        as: "task",
      });
  
      AdHocTaskLog.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "user",
      });
    };
  
    return AdHocTaskLog;
  };
  
  export default AdHocTaskLogModel;
  