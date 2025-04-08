export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('boiler_devices', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      boilerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'boilers', key: 'id' },
        onDelete: 'CASCADE',
      },
      deviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'devices', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('boiler_devices');
  },
};
