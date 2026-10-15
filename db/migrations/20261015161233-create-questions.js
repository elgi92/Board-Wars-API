'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('questions', {
      question_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      question_set_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'question_sets',
          key: 'question_set_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      correct_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      time_limit_sec: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },

      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addConstraint('questions', {
      type: 'unique',
      name: 'uq_questions_set_order',
      fields: ['question_set_id', 'order_index'],
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE questions
      ADD CONSTRAINT ck_questions_type
      CHECK (type IN ('multiple_choice', 'true_false'));

      ALTER TABLE questions
      ADD CONSTRAINT ck_questions_correct_index
      CHECK (correct_index >= 0);

      ALTER TABLE questions
      ADD CONSTRAINT ck_questions_time_limit
      CHECK (time_limit_sec > 0);

      ALTER TABLE questions
      ADD CONSTRAINT ck_questions_order_index
      CHECK (order_index >= 0);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('questions');
  },
};