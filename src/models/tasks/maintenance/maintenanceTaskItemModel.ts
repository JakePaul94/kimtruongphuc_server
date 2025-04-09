import {
    DataTypes,
    Model,
    Sequelize,
    Optional,
    ModelStatic,
  } from "sequelize";
  
  // 1. Định nghĩa kiểu dữ liệu
  export interface MaintenanceTaskItemAttributes {
    id: number;
    taskId: number;
    title: string;
    result?: string | null;
    photoUrl?: string | null;
    status?: "pending" | "done";
  }
  
  // 2. Dùng Optional cho các trường không bắt buộc khi tạo
  export interface MaintenanceTaskItemCreationAttributes
    extends Optional<MaintenanceTaskItemAttributes, "id" | "result" | "photoUrl" | "status"> {}
  
  // 3. Instance kết hợp với Model
  export interface MaintenanceTaskItemInstance
    extends Model<MaintenanceTaskItemAttributes, MaintenanceTaskItemCreationAttributes>,
      MaintenanceTaskItemAttributes {
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // 4. Hàm khởi tạo model
  const MaintenanceTaskItemModel = (sequelize: Sequelize) => {
    const MaintenanceTaskItem = sequelize.define<MaintenanceTaskItemInstance>(
      "MaintenanceTaskItem",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        taskId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        result: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        photoUrl: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("pending", "done"),
          defaultValue: "pending",
        },
      },
      {
        tableName: "maintenance_task_items",
        timestamps: true,
      }
    );
  
    (MaintenanceTaskItem as any).associate = (models: { MaintenanceTask: ModelStatic<Model> }) => {
      MaintenanceTaskItem.belongsTo(models.MaintenanceTask, {
        foreignKey: "taskId",
        as: "task",
      });
    };
  
    return MaintenanceTaskItem;
  };
  
  export default MaintenanceTaskItemModel;
  