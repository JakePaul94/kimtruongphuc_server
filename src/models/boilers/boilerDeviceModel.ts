import { DataTypes, Model, Sequelize } from 'sequelize';

export interface BoilerDeviceAttributes {
  id: number;
  boilerId: number;
  deviceId: number;
}

export interface BoilerDeviceInstance extends Model<BoilerDeviceAttributes>, BoilerDeviceAttributes {}

const BoilerDeviceModel = (sequelize: Sequelize) => {
  const BoilerDevice = sequelize.define<BoilerDeviceInstance>('BoilerDevice', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    boilerId: { type: DataTypes.INTEGER, allowNull: false },
    deviceId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'boiler_devices',
    timestamps: true,
  });
  (BoilerDevice as any).associate = (models: any) => {
    BoilerDevice.belongsTo(models.Boiler, {
      foreignKey: "boilerId",
      as: "boiler",
    });
  
    BoilerDevice.belongsTo(models.Device, {
      foreignKey: "deviceId",
      as: "device",
    });
  };
  
  return BoilerDevice;
};

export default BoilerDeviceModel;
