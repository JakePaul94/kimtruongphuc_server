'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('water_report_tasks', 'scheduledDate', {
      type: Sequelize.STRING,
      allowNull: false, // Giữ nguyên thuộc tính allowNull nếu cần
      // Thêm các thuộc tính khác nếu cần (ví dụ: length)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('water_report_tasks', 'scheduledDate', {
      type: Sequelize.DATE,
      allowNull: false, // Giữ nguyên thuộc tính allowNull nếu cần
    });
  }
};