'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('session_players', {
      session_player_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      seat_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      nickname: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      team_color: {
        type: Sequelize.STRING(4),
        allowNull: false,
      },

      row_position: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      column_position: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      correct_answers: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      wrong_answers: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      movement_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      finished: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      finished_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addConstraint('session_players', {
      type: 'unique',
      name: 'uq_session_players_seat',
      fields: ['seat_id'],
    });

    await queryInterface.addConstraint('session_players', {
      type: 'unique',
      name: 'uq_session_players_position',
      fields: ['session_id', 'row_position', 'column_position'],
    });

    await queryInterface.addConstraint('session_players', {
      type: 'unique',
      name: 'uq_session_players_nickname',
      fields: ['session_id', 'nickname'],
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE session_players
      ADD CONSTRAINT fk_session_players_seat_game
      FOREIGN KEY (seat_id, session_id)
      REFERENCES seat (seat_id, game)
      ON UPDATE CASCADE
      ON DELETE CASCADE;

      ALTER TABLE session_players
      ADD CONSTRAINT ck_session_players_nickname_length
      CHECK (char_length(nickname) BETWEEN 2 AND 20);

      ALTER TABLE session_players
      ADD CONSTRAINT ck_session_players_team_color
      CHECK (team_color IN ('RED', 'BLUE'));

      ALTER TABLE session_players
      ADD CONSTRAINT ck_session_players_row
      CHECK (row_position BETWEEN 1 AND 15);

      ALTER TABLE session_players
      ADD CONSTRAINT ck_session_players_column
      CHECK (column_position BETWEEN 1 AND 15);

      ALTER TABLE session_players
      ADD CONSTRAINT ck_session_players_correct_answers
      CHECK (correct_answers >= 0);

      ALTER TABLE session_players
      ADD CONSTRAINT ck_session_players_wrong_answers
      CHECK (wrong_answers >= 0);

      ALTER TABLE session_players
      ADD CONSTRAINT ck_session_players_finish_state
      CHECK (
        (finished = FALSE AND finished_at IS NULL)
        OR
        (finished = TRUE AND finished_at IS NOT NULL)
      );
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('session_players');
  },
};