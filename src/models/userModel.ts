import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { RefreshTokenInstance } from "./refreshTokenModel";

export interface UserAttributes {
  id: number;
  password: string;
  email: string;
  fullName: string;
  profilePicture?: string | null;
  phoneNumber?: string | null;
  registrationDate: Date;
  lastUpdatedAt?: Date | null;
  accountStatus: string;
  role: string;
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
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "employee",
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

  // 🛠 Thêm association vào model
  (User as any).associate = (models: { RefreshToken: ModelStatic<Model> }) => {
    User.hasMany(models.RefreshToken, {
      foreignKey: "userId",
      as: "refreshTokens",
      onDelete: "CASCADE",
    });

    User.belongsTo(User, { as: "Manager", foreignKey: "reportingManagerId" });
    User.hasMany(User, {
      as: "Subordinates",
      foreignKey: "reportingManagerId",
    });
  };

  return User;
};

export default UserModel;
