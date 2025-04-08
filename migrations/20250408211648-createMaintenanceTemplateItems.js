'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('maintenanceTemplateItems', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'maintenanceTemplates', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      instruction: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('maintenanceTemplateItems');
  },
};
