'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('answers', {
      answer_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      session_player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'session_players',
          key: 'session_player_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      choice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      round_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },

      answered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addConstraint('answers', {
      type: 'unique',
      name: 'uq_answers_player_round',
      fields: ['session_player_id', 'round_number'],
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE answers
      ADD CONSTRAINT fk_answers_choice_question
      FOREIGN KEY (choice_id, question_id)
      REFERENCES choices (choice_id, question_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;

      ALTER TABLE answers
      ADD CONSTRAINT ck_answers_round_number
      CHECK (round_number >= 1);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('answers');
  },
};