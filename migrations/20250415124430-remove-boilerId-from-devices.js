'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Devices', 'boilerId');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Devices', 'boilerId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Hoặc false tùy thuộc vào yêu cầu ban đầu
      references: {
        model: 'Boilers', // Tên bảng mà boilerId tham chiếu đến
        key: 'id',       // Tên cột khóa chính trong bảng Boilers
      },
      onUpdate: 'CASCADE', // Hoặc tùy thuộc vào yêu cầu
      onDelete: 'SET NULL', // Hoặc tùy thuộc vào yêu cầu
    });
  }
};