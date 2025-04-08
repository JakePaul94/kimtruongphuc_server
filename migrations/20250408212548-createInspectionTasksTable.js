'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inspectionTasks', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      deviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'devices', key: 'id' },
        onDelete: 'CASCADE',
      },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'inspectionTemplates', key: 'id' },
        onDelete: 'SET NULL',
      },
      assignedTo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'pending' },
      scheduledDate: { type: Sequelize.DATE, allowNull: false },
      completedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('inspectionTasks');
  },
};
