'use strict';

// Nhớ import ENUM nếu bạn dùng nó trực tiếp thay vì Sequelize.ENUM
// const { ENUM } = require('sequelize'); 

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cleaning_tasks', {
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
          model: 'cleaning_templates', // Đảm bảo tên bảng này chính xác
          key: 'id',
        },
        onDelete: 'CASCADE', // Khớp với model (mặc định hoặc nếu có)
      },
      boilerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'boilers', // Đảm bảo tên bảng này chính xác
          key: 'id',
        },
        onDelete: 'CASCADE', // Khớp với model (mặc định hoặc nếu có)
      },
      assignedTo: {
        type: Sequelize.INTEGER,
        allowNull: true, // Khớp với model
        references: {
          model: 'users', // Đảm bảo tên bảng này chính xác
          key: 'id',
        },
        onDelete: 'SET NULL', // Khớp với model
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true, // Khớp với model
        references: {
          model: 'users', // Đảm bảo tên bảng này chính xác
          key: 'id',
        },
        onDelete: 'SET NULL', // Khớp với model
      },
      // Cột 'date' bị loại bỏ vì không có trong model
      // date: {
      //   type: Sequelize.STRING,
      //   allowNull: false,
      // },
      status: {
        // Sửa lại kiểu dữ liệu thành ENUM để khớp model
        type: Sequelize.ENUM('pending', 'in_process', 'completed', 'canceled'),
        allowNull: false,
        defaultValue: 'pending', // Khớp với model
      },
      scheduledDate: {
        type: Sequelize.DATEONLY, // Khớp với model
        allowNull: false, // Khớp với model
      },
      completedAt: {
        type: Sequelize.DATE, // Khớp với model
        allowNull: true, // Khớp với model
      },
      // Sequelize tự động thêm createdAt và updatedAt nếu timestamps: true trong model
      // Việc định nghĩa rõ ràng trong migration là tốt
      createdAt: {
          type: Sequelize.DATE,
          allowNull: false, // Mặc định của Sequelize timestamps
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') // Hoặc dùng Sequelize.NOW
      },
      updatedAt: {
          type: Sequelize.DATE,
          allowNull: false, // Mặc định của Sequelize timestamps
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') // Hoặc dùng Sequelize.NOW
      },
    });
  },

  down: async (queryInterface) => {
    // Hàm down giữ nguyên, xóa bảng nếu rollback
    await queryInterface.dropTable('cleaning_tasks');
  },
};