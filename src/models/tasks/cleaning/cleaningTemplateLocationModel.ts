import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

// 1. Attributes Interface - Thêm qrCodeIdentifier
export interface CleaningTemplateLocationAttributes {
  id: number;
  templateId: number;
  name: string;
  qrCodeIdentifier: string; // <-- THÊM DÒNG NÀY
  instructions?: string | null;
  exampleImageUrl?: string | null;
}

// 2. Instance Interface (không cần thay đổi)
export interface CleaningTemplateLocationInstance
  extends Model<CleaningTemplateLocationAttributes>,
    CleaningTemplateLocationAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

// 3. Model Definition Function
const CleaningTemplateLocationModel = (sequelize: Sequelize) => {
  const CleaningTemplateLocation = sequelize.define<CleaningTemplateLocationInstance>(
    "CleaningTemplateLocation",
    {
      // Các trường hiện có
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      templateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { // Thêm references để đảm bảo ràng buộc khóa ngoại
          model: 'cleaning_templates', // Tên bảng của CleaningTemplate
          key: 'id'
        },
        onDelete: 'CASCADE' // Xóa location nếu template bị xóa
      },
      name: { type: DataTypes.STRING, allowNull: false },

      // --- THÊM TRƯỜNG MỚI ---
      qrCodeIdentifier: {
        type: DataTypes.STRING,
        allowNull: false, // Bắt buộc phải có
        unique: true,     // Đảm bảo mỗi QR code là duy nhất trong bảng
      },
      // -----------------------

      instructions: { type: DataTypes.TEXT, allowNull: true },
      exampleImageUrl: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "cleaning_template_locations",
      timestamps: true,
      // Thêm index để tối ưu truy vấn nếu cần (ví dụ: tìm theo qrCodeIdentifier)
      indexes: [
        {
          unique: true,
          fields: ['qrCodeIdentifier']
        }
      ]
    }
  );

  // 4. Associations (không cần thay đổi)
  (CleaningTemplateLocation as any).associate = (models: {
    CleaningTemplate: ModelStatic<Model>;
  }) => {
    CleaningTemplateLocation.belongsTo(models.CleaningTemplate, {
      foreignKey: "templateId",
      as: "template",
    });
  };

  return CleaningTemplateLocation;
};

export default CleaningTemplateLocationModel;