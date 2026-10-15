'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seat', {
      seat_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      game: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'game_sessions',
          key: 'session_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      seat_number: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addConstraint('seat', {
      type: 'unique',
      name: 'uq_seat_game_user',
      fields: ['game', 'user_id'],
    });

    // Supports the composite foreign key in session_players.
    await queryInterface.addConstraint('seat', {
      type: 'unique',
      name: 'uq_seat_seat_id_game',
      fields: ['seat_id', 'game'],
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE seat
      ADD CONSTRAINT ck_seat_number
      CHECK (seat_number IS NULL OR seat_number BETWEEN 1 AND 30);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('seat');
  },
};