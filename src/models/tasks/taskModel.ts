// src/models/tasks/taskModel.ts
import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export interface TaskAttributes {
  id?: number;
  title: string;                 // Tiêu đề công việc (VD: "Bảo trì định kỳ máy XYZ")
  description?: string | null;    // Mô tả chi tiết
  taskType: string;              // Loại công việc (VD: 'MAINTENANCE_REQUEST', 'INSPECTION_REQUEST', 'GENERAL')
  status: string;                // Trạng thái (VD: 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
  priority?: string | null;       // Độ ưu tiên (VD: 'LOW', 'MEDIUM', 'HIGH')
  requesterUserId: number;       // ID người yêu cầu (FK đến users.id)
  assignedUserId?: number | null; // ID người được giao việc (FK đến users.id)
  assignedGroupId?: number | null;// ID nhóm được giao việc (FK đến groups.id - nếu có)
  deviceId?: number | null;       // ID thiết bị liên quan (FK đến devices.id)
  dueDate?: Date | null;          // Hạn hoàn thành
  completedAt?: Date | null;      // Ngày giờ hoàn thành
  relatedMaintenanceRecordId?: number | null; // Liên kết đến bản ghi bảo trì (FK)
  relatedInspectionRecordId?: number | null; // Liên kết đến bản ghi kiểm định (FK)
  beforeImagePath?: string | null; // <<< THÊM MỚI: Đường dẫn ảnh trước công việc
  afterImagePath?: string | null;  // <<< THÊM MỚI: Đường dẫn ảnh sau công việc
  createdAt?: Date;
  updatedAt?: Date;
}

// Cập nhật TaskCreationAttributes để bao gồm các trường mới là optional
export interface TaskCreationAttributes extends Optional<TaskAttributes,
  'id' | 'description' | 'priority' | 'assignedUserId' | 'assignedGroupId' |
  'deviceId' | 'dueDate' | 'completedAt' | 'relatedMaintenanceRecordId' |
  'relatedInspectionRecordId' | 'beforeImagePath' | 'afterImagePath' | // <<< THÊM MỚI
  'createdAt' | 'updatedAt'
> {}

export interface TaskInstance extends Model<TaskAttributes, TaskCreationAttributes>, TaskAttributes {
    // Khai báo các phương thức hoặc thuộc tính ảo nếu có
}

const TaskModel = (sequelize: Sequelize) => {
  const Task = sequelize.define<TaskInstance>('Task', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    taskType: { type: DataTypes.STRING(50), allowNull: false }, // Nên dùng ENUM nếu DB hỗ trợ tốt
    status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'PENDING' }, // Nên dùng ENUM
    priority: { type: DataTypes.STRING(50), allowNull: true, defaultValue: 'MEDIUM' }, // Nên dùng ENUM
    requesterUserId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    assignedUserId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
    // assignedGroupId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'groups', key: 'id' }, onDelete: 'SET NULL' }, // Nếu có bảng groups
    deviceId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'devices', key: 'id' }, onDelete: 'SET NULL' },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    relatedMaintenanceRecordId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'maintenance_records', key: 'id' }, onDelete: 'SET NULL' },
    relatedInspectionRecordId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'inspection_records', key: 'id' }, onDelete: 'SET NULL' },
    beforeImagePath: { type: DataTypes.STRING, allowNull: true }, // <<< THÊM MỚI: Kiểu STRING, cho phép NULL
    afterImagePath: { type: DataTypes.STRING, allowNull: true },  // <<< THÊM MỚI: Kiểu STRING, cho phép NULL
  }, {
    tableName: 'tasks',
    timestamps: true,
    underscored: true,
  });

  // Định nghĩa Associations (không thay đổi)
  (Task as any).associate = (models: any) => {
    Task.belongsTo(models.User, { foreignKey: 'requesterUserId', as: 'requester' });
    Task.belongsTo(models.User, { foreignKey: 'assignedUserId', as: 'assignee' });
    // Task.belongsTo(models.Group, { foreignKey: 'assignedGroupId', as: 'assignedGroup' }); // Nếu có Group model
    Task.belongsTo(models.Device, { foreignKey: 'deviceId', as: 'device' });
    Task.belongsTo(models.MaintenanceRecord, { foreignKey: 'relatedMaintenanceRecordId', as: 'maintenanceRecord'});
    Task.belongsTo(models.InspectionRecord, { foreignKey: 'relatedInspectionRecordId', as: 'inspectionRecord'});
  };

  return Task;
};

export default TaskModel;