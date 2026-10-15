'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_sessions', {
      session_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      host_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      question_set_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'question_sets',
          key: 'question_set_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      join_code: {
        type: Sequelize.STRING(6),
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'waiting',
      },

      current_round: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      current_question_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'questions',
          key: 'question_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      winner_team: {
        type: Sequelize.STRING(4),
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },

      started_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      ended_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addConstraint('game_sessions', {
      type: 'unique',
      name: 'uq_game_sessions_join_code',
      fields: ['join_code'],
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE game_sessions
      ADD CONSTRAINT ck_game_sessions_join_code
      CHECK (join_code ~ '^[0-9]{6}$');

      ALTER TABLE game_sessions
      ADD CONSTRAINT ck_game_sessions_status
      CHECK (status IN ('waiting', 'active', 'finished'));

      ALTER TABLE game_sessions
      ADD CONSTRAINT ck_game_sessions_current_round
      CHECK (current_round >= 1);

      ALTER TABLE game_sessions
      ADD CONSTRAINT ck_game_sessions_winner_team
      CHECK (winner_team IS NULL OR winner_team IN ('RED', 'BLUE'));
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('game_sessions');
  },
};