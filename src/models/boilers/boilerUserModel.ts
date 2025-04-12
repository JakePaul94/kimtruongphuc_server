import { DataTypes, Model, ModelStatic, Optional, Sequelize } from 'sequelize';

export interface BoilerUserAttributes {
  id: number;
  boilerId: number;
  userId: number;
}

export interface BoilerUserCreationAttributes
  extends Optional<BoilerUserAttributes, 'id'> {}

export interface BoilerUserInstance
  extends Model<BoilerUserAttributes, BoilerUserCreationAttributes>,
    BoilerUserAttributes {}

const BoilerUserModel = (sequelize: Sequelize) => {
  const BoilerUser = sequelize.define<BoilerUserInstance>('BoilerUser', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    boilerId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'boiler_users',
    timestamps: true,
  });
  (BoilerUser as any).associate = (models: {
      Boiler: ModelStatic<Model>;
      User: ModelStatic<Model>;
    }) => {
    BoilerUser.belongsTo(models.Boiler, {
      foreignKey: "boilerId",
      as: "boiler",
    });
  
    BoilerUser.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };
  
  return BoilerUser;
};

export default BoilerUserModel;
