'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('choices', {
      choice_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'question_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      choice_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      choice_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint('choices', {
      type: 'unique',
      name: 'uq_choices_question_index',
      fields: ['question_id', 'choice_index'],
    });

    // Supports the composite foreign key in the answers table.
    await queryInterface.addConstraint('choices', {
      type: 'unique',
      name: 'uq_choices_choice_question',
      fields: ['choice_id', 'question_id'],
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE choices
      ADD CONSTRAINT ck_choices_index
      CHECK (choice_index >= 0);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('choices');
  },
};