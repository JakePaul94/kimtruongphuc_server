'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tasks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      task_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      priority: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'MEDIUM',
      },
      requester_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      assigned_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'devices',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      related_maintenance_record_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'maintenance_records',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      related_inspection_record_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'inspection_records',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      before_image_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      after_image_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('tasks');
  },
};
