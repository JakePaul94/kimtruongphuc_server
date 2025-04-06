import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize';
import { UserInstance } from './userModel';

interface RefreshTokenAttributes {
  id?: number;
  token: string;
  userId: number;
  expiresAt?: Date | null;
  deviceIdentifier?: string | null;
}

export interface RefreshTokenInstance extends Model<RefreshTokenAttributes>, RefreshTokenAttributes {
  createdAt?: Date;
  updatedAt?: Date;
  User?: UserInstance;
}

const RefreshTokenModel = (sequelize: Sequelize) => {
  const RefreshToken = sequelize.define<RefreshTokenInstance>(
    'RefreshToken',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      token: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      expiresAt: { type: DataTypes.DATE, allowNull: true },
      deviceIdentifier: { type: DataTypes.STRING(255), allowNull: true },
    },
    {
      tableName: 'refresh_tokens',
      timestamps: true,
      underscored: true,
    }
  );

  // 🛠 Thêm association vào model
  (RefreshToken as any).associate = (models: { User: ModelStatic<Model> }) => {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return RefreshToken;
};

export default RefreshTokenModel;