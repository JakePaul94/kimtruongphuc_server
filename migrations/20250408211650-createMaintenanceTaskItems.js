'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('maintenanceTaskItems', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'maintenanceTasks', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      result: { type: Sequelize.TEXT, allowNull: true },
      photoUrl: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('maintenanceTaskItems');
  },
};
