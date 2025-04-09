'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inspection_tasks', {
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
        references: { model: 'inspection_templates', key: 'id' },
        onDelete: 'SET NULL',
      },

      assignedTo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },

      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },

      scheduledDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inspection_tasks');
  },
};
