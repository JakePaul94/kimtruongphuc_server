'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inspectionTemplateItems', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'inspectionTemplates', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      instruction: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('inspectionTemplateItems');
  },
};
