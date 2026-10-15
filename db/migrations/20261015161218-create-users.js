'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      school_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      full_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING(254),
        allowNull: false,
      },

      role: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'PLAYER',
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addConstraint('users', {
      type: 'unique',
      name: 'uq_users_school_id',
      fields: ['school_id'],
    });

    await queryInterface.addConstraint('users', {
      type: 'unique',
      name: 'uq_users_email',
      fields: ['email'],
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE users
      ADD CONSTRAINT ck_users_role
      CHECK (role IN ('PLAYER', 'HOST', 'ADMIN'));
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};