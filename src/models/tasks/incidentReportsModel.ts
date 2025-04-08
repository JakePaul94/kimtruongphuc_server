import {
    DataTypes,
    Model,
    Optional,
    Sequelize,
    ModelStatic,
  } from "sequelize";
  
  // 1. Attributes
  export interface IncidentReportAttributes {
    id: number;
    deviceId: number;
    reportedBy: number;
    description: string;
    status: "pending" | "in_progress" | "resolved";
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // 2. CreationAttributes
  export interface IncidentReportCreationAttributes
    extends Optional<IncidentReportAttributes, "id"> {}
  
  // 3. Instance
  export interface IncidentReportInstance
    extends Model<IncidentReportAttributes, IncidentReportCreationAttributes>,
      IncidentReportAttributes {}
  
  // 4. Model definition
  const IncidentReportModel = (sequelize: Sequelize) => {
    const IncidentReport = sequelize.define<IncidentReportInstance>(
      "IncidentReport",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        deviceId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        reportedBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM("pending", "in_progress", "resolved"),
          allowNull: false,
          defaultValue: "pending",
        },
      },
      {
        tableName: "incident_reports",
        timestamps: true,
      }
    );
  
    (IncidentReport as any).associate = (models: {
      IncidentReportPhoto: ModelStatic<Model>;
      Device: ModelStatic<Model>;
      User: ModelStatic<Model>;
    }) => {
      IncidentReport.hasMany(models.IncidentReportPhoto, {
        foreignKey: "incidentReportId",
        as: "photos",
        onDelete: "CASCADE",
      });
  
      IncidentReport.belongsTo(models.Device, {
        foreignKey: "deviceId",
        as: "device",
      });
  
      IncidentReport.belongsTo(models.User, {
        foreignKey: "reportedBy",
        as: "reporter",
      });
    };
  
    return IncidentReport;
  };
  
  export default IncidentReportModel;
  