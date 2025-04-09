'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cleaning_task_locations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cleaning_tasks',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      templateLocationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cleaning_template_locations',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      photoUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('cleaning_task_locations');
  },
};
