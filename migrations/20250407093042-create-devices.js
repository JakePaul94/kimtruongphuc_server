'use strict';

 module.exports = {
   up: async (queryInterface, Sequelize) => {
     await queryInterface.createTable('devices', {
       id: {
         type: Sequelize.INTEGER,
         autoIncrement: true,
         primaryKey: true,
         allowNull: false, // Thêm allowNull: false cho rõ ràng hơn dù PK mặc định là non-null
       },
       device_code: {
         type: Sequelize.STRING(100),
         allowNull: false,
         unique: true,
       },
       device_name: {
         type: Sequelize.STRING(255),
         allowNull: false,
       },
       parent_id: {
         type: Sequelize.INTEGER,
         allowNull: true, // Khớp model
         references: {
           model: 'devices', // Tự tham chiếu đến chính nó
           key: 'id',
         },
         onDelete: 'SET NULL', // Khớp model
         onUpdate: 'CASCADE', // Thường là mặc định tốt
       },
       boiler_id: {
         type: Sequelize.INTEGER,
         allowNull: true, // Khớp model
         references: {
           model: 'boilers', // Tham chiếu đến bảng boilers
           key: 'id',
         },
         onDelete: 'SET NULL', // Khớp model
         onUpdate: 'CASCADE',
       },
       model: { // Các trường nullable không cần ghi allowNull: true
           type: Sequelize.STRING(100),
       },
       brand: {
           type: Sequelize.STRING(100),
       },
       origin: {
           type: Sequelize.STRING(100),
       },
       // *** THÊM TRƯỜNG BỊ THIẾU ***
       image_url: {
           type: Sequelize.STRING(255),
           allowNull: true // Khớp với model
       },
       // ***************************
       year_of_manufacture: {
           type: Sequelize.INTEGER,
       },
       serial_number: {
           type: Sequelize.STRING(100),
           unique: true // Thêm unique constraint nếu Serial Number phải là duy nhất
       },
       usage_status: {
           type: Sequelize.STRING(100),
       },
       installation_date: {
           type: Sequelize.DATE,
       },
       warranty_expiration: {
           type: Sequelize.DATE,
       },
       location: {
           type: Sequelize.STRING(255),
       },
       value: {
           type: Sequelize.DECIMAL(15, 2),
       },
       department: {
           type: Sequelize.STRING(100),
       },
       manager: {
           type: Sequelize.STRING(100),
       },
       maintenance_cycle: {
           type: Sequelize.STRING(100),
       },
       last_maintenance_date: {
           type: Sequelize.DATE,
       },
       next_maintenance_date: {
           type: Sequelize.DATE,
       },
       operating_hours: {
           type: Sequelize.INTEGER,
       },
       maintenance_history: {
           type: Sequelize.TEXT,
       },
       depreciation_value: {
           type: Sequelize.DECIMAL(15, 2),
       },
       last_checked: {
           type: Sequelize.DATE,
       },
       is_under_warranty: {
         type: Sequelize.BOOLEAN,
         defaultValue: true, // Khớp model
         allowNull: false // Boolean thường không nên null, set giá trị mặc định
       },
       location_details: {
           type: Sequelize.STRING(255),
       },
       is_need_maintenance: {
         type: Sequelize.BOOLEAN,
         defaultValue: false, // Khớp model
         allowNull: false // Boolean thường không nên null, set giá trị mặc định
       },
       last_inspection_date: {
           type: Sequelize.DATE,
       },
       next_inspection_date: {
           type: Sequelize.DATE,
       },
       inspection_history: {
           type: Sequelize.TEXT,
       },
       inspection_status: {
           type: Sequelize.STRING(50),
       },
       created_at: {
         type: Sequelize.DATE,
         allowNull: false,
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
       },
       updated_at: {
         type: Sequelize.DATE,
         allowNull: false,
         defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
       },
     });
   },

   down: async (queryInterface) => {
     await queryInterface.dropTable('devices');
   },
 };