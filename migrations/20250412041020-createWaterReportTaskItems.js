'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('water_report_task_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'water_report_tasks', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      templateItemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'water_report_template_items', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      imageUrl: { type: Sequelize.STRING, allowNull: true },
      valueFromAI: { type: Sequelize.STRING, allowNull: true },
      isQualify: { type: Sequelize.BOOLEAN, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE },
    });

    await queryInterface.addIndex(
      'water_report_task_items',
      ['taskId', 'templateItemId'],
      {
        unique: true,
        name: 'uniqueItemPerTask',
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('water_report_task_items');
  },
};
