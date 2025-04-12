import { DataTypes, Model, Sequelize, Optional, ModelStatic } from "sequelize";
import { WaterReportTaskInstance } from "./waterReportTaskModel";
import { WaterReportTemplateItemInstance } from "./waterReportTemplateItemModel";

export interface WaterReportTaskItemAttributes {
  id: number;
  taskId: number;
  templateItemId: number; // Tham chiếu đến mục trong template
  imageUrl?: string | null;
  valueFromAI?: string | null;
  isQualify?: boolean | null;
  notes?: string | null; // Ghi chú cho mục cụ thể này (nếu cần)
}

export interface WaterReportTaskItemCreationAttributes
  extends Optional<
    WaterReportTaskItemAttributes,
    "id" | "imageUrl" | "valueFromAI" | "isQualify" | "notes"
  > {}

export interface WaterReportTaskItemInstance
  extends Model<
      WaterReportTaskItemAttributes,
      WaterReportTaskItemCreationAttributes
    >,
    WaterReportTaskItemAttributes {
  createdAt?: Date;
  updatedAt?: Date;
  task?: WaterReportTaskInstance;
  templateItem?: WaterReportTemplateItemInstance;
}

const WaterReportTaskItemModel = (sequelize: Sequelize) => {
  const WaterReportTaskItem = sequelize.define<WaterReportTaskItemInstance>(
    "WaterReportTaskItem",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "water_report_tasks", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      templateItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "water_report_template_items", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      imageUrl: {
        type: DataTypes.STRING, // Lưu URL ảnh
        allowNull: true,
      },
      valueFromAI: {
        type: DataTypes.STRING, // Giá trị phân tích từ AI (nếu có)
        allowNull: true,
      },
      isQualify: {
        type: DataTypes.BOOLEAN, // Đánh dấu là đạt yêu cầu hay không
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "water_report_task_items",
      timestamps: true,
      indexes: [
        // Thay thế uniqueKeys bằng indexes
        {
          unique: true,
          fields: ["taskId", "templateItemId"],
          name: "uniqueItemPerTask", // Tên index (tùy chọn)
        },
      ],
    }
  );

  (WaterReportTaskItem as any).associate = (models: {
    WaterReportTask: ModelStatic<Model>;
    WaterReportTemplateItem: ModelStatic<Model>;
  }) => {
    WaterReportTaskItem.belongsTo(models.WaterReportTask, {
      foreignKey: "taskId",
      as: "task",
    });
    WaterReportTaskItem.belongsTo(models.WaterReportTemplateItem, {
      foreignKey: "templateItemId",
      as: "templateItem",
    });
  };

  return WaterReportTaskItem;
};

export default WaterReportTaskItemModel;