import { DataTypes, Model, Sequelize, Optional, ModelStatic } from "sequelize";
import { WaterReportTemplateInstance } from "./waterReportTemplateModel";
import { WaterReportTaskItemInstance } from "./waterReportTaskItemModel";
import { BoilerInstance } from "../../boilers/boilerModel"; // Giả sử bạn có model Boiler
import { UserInstance } from "../../userModel"; // Giả sử bạn có model User
import { TaskStatusType } from "../../../types/taskStatusType";

export interface WaterReportTaskAttributes {
  id: number;
  templateId: number;
  boilerId: number;
  assignedTo?: number | null;
  scheduledDate: string;
  status:TaskStatusType; // Trạng thái của phiên bản báo cáo
  createdBy?: number | null;
  completedAt?: Date | null;
}

export interface WaterReportTaskCreationAttributes
  extends Optional<
    WaterReportTaskAttributes,
    "id" | "assignedTo" | "status" | "createdBy" | "completedAt"
  > {}

export interface WaterReportTaskInstance
  extends Model<WaterReportTaskAttributes, WaterReportTaskCreationAttributes>,
    WaterReportTaskAttributes {
  createdAt?: Date;
  updatedAt?: Date;
  template?: WaterReportTemplateInstance;
  boiler?: BoilerInstance;
  assignee?: UserInstance;
  creator?: UserInstance;
  items?: WaterReportTaskItemInstance[];
}

const WaterReportTaskModel = (sequelize: Sequelize) => {
  const WaterReportTask = sequelize.define<WaterReportTaskInstance>(
    "WaterReportTask",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      templateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "water_report_templates", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      boilerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "boilers", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      scheduledDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_process', 'completed', 'canceled'),
        allowNull: false,
        defaultValue: "pending",
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "water_report_tasks",
      timestamps: true,
      indexes: [
        // Thay thế uniqueKeys bằng indexes
        {
          unique: true,
          fields: ["boilerId", "reportDate", "templateId"],
          name: "uniqueReportPerDayBoilerTemplate",
        },
      ],
    }
  );

  (WaterReportTask as any).associate = (models: {
    WaterReportTemplate: ModelStatic<Model>;
    Boiler: ModelStatic<Model>;
    User: ModelStatic<Model>;
    WaterReportTaskItem: ModelStatic<Model>;
  }) => {
    WaterReportTask.belongsTo(models.WaterReportTemplate, {
      foreignKey: "templateId",
      as: "template",
    });
    WaterReportTask.belongsTo(models.Boiler, {
      foreignKey: "boilerId",
      as: "boiler",
    });
    WaterReportTask.belongsTo(models.User, {
      foreignKey: "assignedTo",
      as: "assignee",
    });
    WaterReportTask.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator",
    });
    WaterReportTask.hasMany(models.WaterReportTaskItem, {
      foreignKey: "taskId",
      as: "items",
      onDelete: "CASCADE",
    });
  };

  return WaterReportTask;
};

export default WaterReportTaskModel;
