import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export type UserRole =
  | "admin"
  | "director"
  | "hr"
  | "engineer"
  | "office_staff"
  | "boiler_manager"
  | "boiler_worker";

export interface UserAttributes {
  id: number;
  password: string;
  email: string;
  fullName: string;
  profilePicture?: string | null;
  phoneNumber?: string | null;
  registrationDate: Date;
  lastUpdatedAt?: Date | null;
  accountStatus: "active" | "inactive" | "suspended";
  role: UserRole;
  permissions?: string | null;
  department?: string | null;
  reportingManagerId?: number | null;
  gender?: string | null;
  dateOfBirth?: Date | null;
  address?: string | null;
  country?: string | null;
  firstLogin: boolean;
}

export interface UserInstance extends Model<UserAttributes>, UserAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const UserModel = (sequelize: Sequelize) => {
  const User = sequelize.define<UserInstance>(
    "User",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      password: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      fullName: { type: DataTypes.STRING, allowNull: false },
      profilePicture: { type: DataTypes.STRING, allowNull: true },
      phoneNumber: { type: DataTypes.STRING, allowNull: true },
      registrationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      lastUpdatedAt: { type: DataTypes.DATE, allowNull: true },
      accountStatus: {
        type: DataTypes.ENUM("active", "inactive", "suspended"),
        allowNull: false,
        defaultValue: "active",
      },
      role: {
        type: DataTypes.ENUM(
          "admin",
          "director",
          "hr",
          "engineer",
          "office_staff",
          "boiler_manager",
          "boiler_worker"
        ),
        allowNull: false,
        defaultValue: "office_staff",
      },
      permissions: { type: DataTypes.TEXT, allowNull: true },
      department: { type: DataTypes.STRING, allowNull: true },
      reportingManagerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      gender: { type: DataTypes.STRING(10), allowNull: true },
      dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
      address: { type: DataTypes.STRING, allowNull: true },
      country: { type: DataTypes.STRING, allowNull: true },
      firstLogin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );

  (User as any).associate = (models: {
    RefreshToken: ModelStatic<Model>;
    User: ModelStatic<Model>;
    Boiler: ModelStatic<Model>;
    LoginHistory: ModelStatic<Model>;
    CleaningTask: ModelStatic<Model>;
    MaintenanceTask: ModelStatic<Model>;
    InspectionTask: ModelStatic<Model>;
    AdHocTask: ModelStatic<Model>;
    AdHocTaskLog: ModelStatic<Model>;
    IncidentReport: ModelStatic<Model>;
    CleaningTemplate: ModelStatic<Model>;
    CleaningTaskLocation: ModelStatic<Model>;
    MaintenanceTaskItem: ModelStatic<Model>;
    IncidentReportPhoto: ModelStatic<Model>;
    BoilerUser: ModelStatic<Model>;
  }) => {
    User.hasMany(models.RefreshToken, {
      foreignKey: "userId",
      as: "refreshTokens",
      onDelete: "CASCADE",
    });

    // Quan hệ với chính User (Manager và Subordinates)
    User.belongsTo(User, {
      as: "Manager",
      foreignKey: "reportingManagerId",
    });

    User.hasMany(User, {
      as: "Subordinates",
      foreignKey: "reportingManagerId",
    });

    User.hasMany(models.CleaningTask, {
      foreignKey: "createdBy",
      as: "createdCleaningTasks",
    });
    User.hasMany(models.AdHocTask, {
      foreignKey: "createdBy",
      as: "createdAdHocTasks",
    });

    User.hasMany(models.InspectionTask, {
      foreignKey: "createdBy",
      as: "createdInspectionTasks",
    });

    User.hasMany(models.MaintenanceTask, {
      foreignKey: "createdBy",
      as: "createdMaintenanceTasks",
    });

    User.hasMany(models.CleaningTask, {
      foreignKey: "assignedUserId",
      as: "assignedCleaningTasks",
    });

    // Inspection Tasks
    User.hasMany(models.InspectionTask, {
      foreignKey: "assignedTo",
      as: "assignedInspectionTasks",
    });
    // Ad Hoc Tasks - người được giao task
    User.hasMany(models.AdHocTask, {
      foreignKey: "assignedUserId",
      as: "adHocTasks",
    });

    // Ad Hoc Task Logs - người ghi log
    User.hasMany(models.AdHocTaskLog, {
      foreignKey: "userId",
      as: "adHocTaskLogs",
    });
    // Incident Reports - người báo cáo
    User.hasMany(models.IncidentReport, {
      foreignKey: "reporterId",
      as: "incidentReports",
    });
    User.hasMany(models.BoilerUser, {
      foreignKey: "userId",
      as: "boilerUsers",
    });
    // Login History
    User.hasMany(models.LoginHistory, {
      foreignKey: "userId",
      as: "loginHistory",
    });
    User.hasMany(models.MaintenanceTask, {
      foreignKey: "assignedTo",
      as: "assignedMaintenanceTasks",
    });
  };

  return User;
};

export default UserModel;
