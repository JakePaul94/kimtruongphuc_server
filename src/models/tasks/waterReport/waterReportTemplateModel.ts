import { DataTypes, Model, Sequelize, Optional, ModelStatic } from "sequelize";
import { BoilerInstance } from "../../boilers/boilerModel"; // Import BoilerInstance (giả sử bạn có model này)
import { WaterReportTemplateItemInstance } from "./waterReportTemplateItemModel";

export interface WaterReportTemplateAttributes {
  id: number;
  name: string; // Tên template (ví dụ: "Báo cáo hàng ngày lò hơi loại A")
  description?: string | null;
  boilerId: number; // Thêm trường boilerId
}

export interface WaterReportTemplateCreationAttributes
  extends Optional<WaterReportTemplateAttributes, "id" | "description"> {}

export interface WaterReportTemplateInstance
  extends Model<
      WaterReportTemplateAttributes,
      WaterReportTemplateCreationAttributes
    >,
    WaterReportTemplateAttributes {
  createdAt?: Date;
  updatedAt?: Date;
  boiler?: BoilerInstance;
  items?: WaterReportTemplateItemInstance[]; // Thêm association với Boiler
}

const WaterReportTemplateModel = (sequelize: Sequelize) => {
  const WaterReportTemplate = sequelize.define<WaterReportTemplateInstance>(
    "WaterReportTemplate",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      boilerId: {
        // Định nghĩa trường boilerId
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "boilers", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      tableName: "water_report_templates",
      timestamps: true,
      indexes: [
        // Thay thế uniqueKeys bằng indexes
        {
          unique: true,
          fields: ["name", "boilerId"],
          name: "uniqueTemplateForBoiler", // Tên index (tùy chọn)
        },
      ],
    }
  );

  (WaterReportTemplate as any).associate = (models: {
    WaterReportTemplateItem: ModelStatic<Model>;
    WaterReportTask: ModelStatic<Model>;
    Boiler: ModelStatic<Model>; // Thêm Boiler model
  }) => {
    WaterReportTemplate.hasMany(models.WaterReportTemplateItem, {
      foreignKey: "templateId",
      as: "items",
      onDelete: "CASCADE",
    });
    WaterReportTemplate.hasMany(models.WaterReportTask, {
      foreignKey: "templateId",
      as: "reports",
    });
    WaterReportTemplate.belongsTo(models.Boiler, {
      // Tạo association với Boiler
      foreignKey: "boilerId",
      as: "boiler",
    });
  };

  return WaterReportTemplate;
};

export default WaterReportTemplateModel;
