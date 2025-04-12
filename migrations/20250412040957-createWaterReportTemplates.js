'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('water_report_templates', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      boilerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'boilers', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE },
    });

    await queryInterface.addIndex('water_report_templates', ['name', 'boilerId'], {
      unique: true,
      name: 'uniqueTemplateForBoiler',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('water_report_templates');
  },
};
