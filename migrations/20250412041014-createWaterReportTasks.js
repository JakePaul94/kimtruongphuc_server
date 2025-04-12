'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('water_report_tasks', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'water_report_templates', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      boilerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'boilers', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      assignedTo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      scheduledDate: { type: Sequelize.DATEONLY, allowNull: false },
      status: {
        type: Sequelize.ENUM('pending', 'in_process', 'completed', 'canceled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      completedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE },
    });

    await queryInterface.addIndex(
      'water_report_tasks',
      ['boilerId', 'scheduledDate', 'templateId'],
      {
        unique: true,
        name: 'uniqueReportPerDayBoilerTemplate',
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('water_report_tasks');
  },
};
