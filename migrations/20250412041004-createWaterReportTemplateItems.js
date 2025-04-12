'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('water_report_template_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'water_report_templates', key: 'id' },
        onDelete: 'CASCADE',
      },
      label: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('water_report_template_items');
  },
};
