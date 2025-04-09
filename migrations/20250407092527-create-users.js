"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      password: { type: Sequelize.STRING, allowNull: false },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      fullName: { type: Sequelize.STRING, allowNull: false },
      profilePicture: { type: Sequelize.STRING, allowNull: true },
      phoneNumber: { type: Sequelize.STRING, allowNull: true },

      registrationDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      lastUpdatedAt: { type: Sequelize.DATE, allowNull: true },

      accountStatus: {
        type: Sequelize.ENUM("active", "inactive", "suspended"),
        allowNull: false,
        defaultValue: "active",
      },
      role: {
        type: Sequelize.ENUM(
          "admin",
          "director",
          "hr",
          "engineer",
          "office_staff",
          "boiler_manager",
          "boiler_worker"
        ),
        allowNull: false,
        defaultValue: "office_staff",
      },
      permissions: { type: Sequelize.TEXT, allowNull: true },
      department: { type: Sequelize.STRING, allowNull: true },

      reportingManagerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      gender: { type: Sequelize.STRING(10), allowNull: true },
      dateOfBirth: { type: Sequelize.DATEONLY, allowNull: true },
      address: { type: Sequelize.STRING, allowNull: true },
      country: { type: Sequelize.STRING, allowNull: true },

      firstLogin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    // Xoá ENUMs trước khi drop bảng để tránh lỗi Postgres
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("users", { transaction });
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "enum_users_accountStatus";`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "enum_users_role";`,
        { transaction }
      );
    });
  },
};
