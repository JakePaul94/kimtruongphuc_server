const { faker } = require("@faker-js/faker");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [...Array(10)].map(() => ({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      fullName: faker.person.fullName(),
      password: "123456",
      role: "user",
      profilePicture: faker.image.avatar(),
      phoneNumber: faker.phone.number(),
      registrationDate: faker.date.past(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("users", users);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("users", null, {});
  },
};
