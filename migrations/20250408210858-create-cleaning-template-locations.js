'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cleaning_template_locations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cleaning_templates',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      qrCodeIdentifier: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // đảm bảo không trùng QR
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      exampleImageUrl: {
        type: Sequelize.STRING,
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

    // Optional: tạo thêm index riêng nếu thường xuyên truy vấn bằng qrCodeIdentifier
    await queryInterface.addIndex('cleaning_template_locations', ['qrCodeIdentifier'], {
      unique: true,
      name: 'uq_cleaning_template_locations_qrCodeIdentifier',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('cleaning_template_locations');
  },
};
