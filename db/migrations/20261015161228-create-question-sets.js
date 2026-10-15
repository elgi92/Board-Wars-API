'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('question_sets', {
      question_set_id: {
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

      title: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      subject: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },

      grade_level: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE question_sets
      ADD CONSTRAINT ck_question_sets_title_length
      CHECK (char_length(title) BETWEEN 3 AND 80);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('question_sets');
  },
};