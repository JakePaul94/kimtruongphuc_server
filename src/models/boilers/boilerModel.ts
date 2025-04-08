import { DataTypes, Model, Sequelize } from "sequelize";

export interface BoilerAttributes {
  id: number;
  name: string;
  location: string;
  description?: string | null;
}

export interface BoilerInstance
  extends Model<BoilerAttributes>,
    BoilerAttributes {}

const BoilerModel = (sequelize: Sequelize) => {
  const Boiler = sequelize.define<BoilerInstance>(
    "Boiler",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      location: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "boilers",
      timestamps: true,
    }
  );
  (Boiler as any).associate = (models: any) => {
    Boiler.hasMany(models.BoilerUser, {
      foreignKey: "boilerId",
      as: "users",
      onDelete: "CASCADE",
    });

    Boiler.hasMany(models.BoilerDevice, {
      foreignKey: "boilerId",
      as: "devices",
      onDelete: "CASCADE",
    });
  };

  return Boiler;
};

export default BoilerModel;
