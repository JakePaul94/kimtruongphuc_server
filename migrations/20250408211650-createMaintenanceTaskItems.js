'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('maintenance_task_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'maintenance_tasks', key: 'id' },
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
    await queryInterface.dropTable('maintenance_task_items');
  },
};
