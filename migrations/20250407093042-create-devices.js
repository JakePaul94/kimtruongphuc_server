'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('devices', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
        allowNull: true,
        references: {
          model: 'devices',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      boiler_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'boilers',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      model: Sequelize.STRING(100),
      brand: Sequelize.STRING(100),
      origin: Sequelize.STRING(100),
      year_of_manufacture: Sequelize.INTEGER,
      serial_number: Sequelize.STRING(100),
      usage_status: Sequelize.STRING(100),
      installation_date: Sequelize.DATE,
      warranty_expiration: Sequelize.DATE,
      location: Sequelize.STRING(255),
      value: Sequelize.DECIMAL(15, 2),
      department: Sequelize.STRING(100),
      manager: Sequelize.STRING(100),
      maintenance_cycle: Sequelize.STRING(100),
      last_maintenance_date: Sequelize.DATE,
      next_maintenance_date: Sequelize.DATE,
      operating_hours: Sequelize.INTEGER,
      maintenance_history: Sequelize.TEXT,
      depreciation_value: Sequelize.DECIMAL(15, 2),
      last_checked: Sequelize.DATE,
      is_under_warranty: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      location_details: Sequelize.STRING(255),
      is_need_maintenance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      last_inspection_date: Sequelize.DATE,
      next_inspection_date: Sequelize.DATE,
      inspection_history: Sequelize.TEXT,
      inspection_status: Sequelize.STRING(50),
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
