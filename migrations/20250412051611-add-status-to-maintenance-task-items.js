'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Thêm cột 'status' vào bảng 'maintenance_task_items'.
     */
    await queryInterface.addColumn(
      'maintenance_task_items', // Tên bảng cần thêm cột
      'status', // Tên cột mới
      {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'skipped'), // Các trạng thái khả dụng cho một item (bạn có thể tùy chỉnh)
        allowNull: false,                 // Không cho phép giá trị NULL
        defaultValue: 'pending',          // Giá trị mặc định khi item được tạo
        after: 'photoUrl'                 // (Tùy chọn) Đặt vị trí cột sau cột 'photoUrl' cho dễ nhìn trong DB
      }
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Xóa cột 'status' khỏi bảng 'maintenance_task_items' khi rollback.
     */
    await queryInterface.removeColumn(
      'maintenance_task_items', // Tên bảng
      'status'                  // Tên cột cần xóa
    );
  }
};