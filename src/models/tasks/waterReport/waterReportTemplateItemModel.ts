import { DataTypes, Model, Sequelize, Optional, ModelStatic } from "sequelize";

export interface WaterReportTemplateItemAttributes {
  id: number;
  templateId: number;
  label: string; // Nhãn của mục (ví dụ: "Chỉ số pH", "Ảnh mẫu nước đầu vào")
  description?: string | null;
}

export interface WaterReportTemplateItemCreationAttributes
  extends Optional<WaterReportTemplateItemAttributes, "id" | "description"> {}

export interface WaterReportTemplateItemInstance
  extends Model<WaterReportTemplateItemAttributes, WaterReportTemplateItemCreationAttributes>,
    WaterReportTemplateItemAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const WaterReportTemplateItemModel = (sequelize: Sequelize) => {
  const WaterReportTemplateItem = sequelize.define<WaterReportTemplateItemInstance>(
    "WaterReportTemplateItem",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      templateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'water_report_templates', key: 'id' },
        onDelete: 'CASCADE',
      },
      label: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "water_report_template_items",
      timestamps: true,
    }
  );

  (WaterReportTemplateItem as any).associate = (models: {
    WaterReportTemplate: ModelStatic<Model>;
  }) => {
    WaterReportTemplateItem.belongsTo(models.WaterReportTemplate, {
      foreignKey: "templateId",
      as: "template",
    });
  };

  return WaterReportTemplateItem;
};

export default WaterReportTemplateItemModel;