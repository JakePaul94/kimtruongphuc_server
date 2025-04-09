import { DataTypes, Model, Optional, Sequelize, ModelStatic } from "sequelize";

interface LoginHistoryAttributes {
  id: number;
  userId: number | null;
  loginTimestamp: Date;
  ipAddress: string;
  userAgent: string;
  status: string;
  reason?: string | null;
}

type LoginHistoryCreationAttributes = Optional<LoginHistoryAttributes, 'id' | 'reason'>;

export interface LoginHistoryInstance
  extends Model<LoginHistoryAttributes, LoginHistoryCreationAttributes>,
    LoginHistoryAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

const LoginHistoryModel = (sequelize: Sequelize) => {
  const LoginHistory = sequelize.define<LoginHistoryInstance>(
    "LoginHistory",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
      },
      loginTimestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      ipAddress: { type: DataTypes.STRING(45), allowNull: false },
      userAgent: { type: DataTypes.STRING(255), allowNull: false },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [["success", "failed"]],
        },
      },
      reason: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "login_history",
      timestamps: true,
    }
  );

  (LoginHistory as any).associate = (models: { User: ModelStatic<Model> }) => {
    LoginHistory.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return LoginHistory;
};

export default LoginHistoryModel;
