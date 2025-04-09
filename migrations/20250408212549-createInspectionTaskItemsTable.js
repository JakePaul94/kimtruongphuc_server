'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inspection_tasks_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'inspection_tasks', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      result: { type: Sequelize.TEXT, allowNull: true },
      photoUrl: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('inspection_tasks_items');
  },
};
