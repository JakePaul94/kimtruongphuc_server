"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      username: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      fullName: { type: Sequelize.STRING, allowNull: false },
      profilePicture: { type: Sequelize.STRING },
      phoneNumber: { type: Sequelize.STRING },
      registrationDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      lastUpdatedAt: { type: Sequelize.DATE },
      accountStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "employee",
      },
      permissions: { type: Sequelize.TEXT },
      department: { type: Sequelize.STRING },
      reportingManagerId: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
      },
      gender: { type: Sequelize.STRING(10) },
      dateOfBirth: { type: Sequelize.DATEONLY },
      address: { type: Sequelize.STRING },
      country: { type: Sequelize.STRING },
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
    await queryInterface.dropTable("users");
  },
};
