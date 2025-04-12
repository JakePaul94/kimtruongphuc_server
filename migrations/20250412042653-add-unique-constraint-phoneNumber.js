"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint("users", {
      fields: ["phoneNumber"],
      type: "unique",
      name: "unique_phone_number_constraint", // tên constraint tuỳ chọn
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint("users", "unique_phone_number_constraint");
  },
};
