import {
    DataTypes,
    Model,
    Optional,
    Sequelize,
    ModelStatic,
  } from "sequelize";
  
  // 1. Attributes
  export interface IncidentReportPhotoAttributes {
    id: number;
    incidentReportId: number;
    photoUrl: string;
  }
  
  // 2. CreationAttributes
  export interface IncidentReportPhotoCreationAttributes
    extends Optional<IncidentReportPhotoAttributes, "id"> {}
  
  // 3. Instance
  export interface IncidentReportPhotoInstance
    extends Model<IncidentReportPhotoAttributes, IncidentReportPhotoCreationAttributes>,
      IncidentReportPhotoAttributes {
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // 4. Model
  const IncidentReportPhotoModel = (sequelize: Sequelize) => {
    const IncidentReportPhoto = sequelize.define<IncidentReportPhotoInstance>(
      "IncidentReportPhoto",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        incidentReportId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        photoUrl: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        tableName: "incident_report_photos",
        timestamps: true,
      }
    );
  
    (IncidentReportPhoto as any).associate = (models: {
      IncidentReport: ModelStatic<Model>;
    }) => {
      IncidentReportPhoto.belongsTo(models.IncidentReport, {
        foreignKey: "incidentReportId",
        as: "incidentReport",
      });
    };
  
    return IncidentReportPhoto;
  };
  
  export default IncidentReportPhotoModel;
  