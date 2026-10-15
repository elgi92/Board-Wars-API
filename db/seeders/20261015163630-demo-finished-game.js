'use strict';

const DEMO_JOIN_CODE = '418263';
const HOST_SCHOOL_ID = '2099-0001';
const QUESTION_SET_TITLE = 'Board Wars Demo Questions';

const STARTED_AT = new Date('2026-10-15T08:00:00.000Z');
const ENDED_AT = new Date('2026-10-15T08:12:00.000Z');

const QUESTIONS = [
  {
    text: 'What does CPU stand for?',
    choices: [
      'Central Processing Unit',
      'Computer Personal Unit',
      'Control Program Utility',
      'Central Processor Utility',
    ],
  },
  {
    text: 'Which language commonly adds interactivity to web pages?',
    choices: ['JavaScript', 'SQL', 'C', 'Bash'],
  },
  {
    text: 'Which HTML element creates a hyperlink?',
    choices: ['a', 'p', 'div', 'table'],
  },
  {
    text: 'Which CSS property changes text color?',
    choices: ['color', 'font-style', 'padding', 'display'],
  },
  {
    text: 'Which Git command records staged changes?',
    choices: ['git commit', 'git fetch', 'git status', 'git clone'],
  },
  {
    text: 'Which SQL command retrieves rows?',
    choices: ['SELECT', 'DELETE', 'DROP', 'ALTER'],
  },
  {
    text: 'What does API commonly stand for?',
    choices: [
      'Application Programming Interface',
      'Applied Program Internet',
      'Application Process Instruction',
      'Automated Programming Input',
    ],
  },
  {
    text: 'Which HTTP method normally retrieves a resource?',
    choices: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
  {
    text: 'What does a primary key identify?',
    choices: [
      'A unique row in a table',
      'A database password',
      'A network port',
      'A CSS selector',
    ],
  },
  {
    text: 'Which data format is commonly used in REST APIs?',
    choices: ['JSON', 'MP3', 'PNG', 'EXE'],
  },
  {
    text: 'Which package is the web framework in the Week 10 stack?',
    choices: ['Express', 'Sequelize CLI', 'Postman', 'Git'],
  },
  {
    text: 'What does a foreign key reference?',
    choices: [
      'A key in another table or the same table',
      'A browser cache',
      'A Git branch only',
      'An HTML heading',
    ],
  },
  {
    text: 'Which command installs project dependencies?',
    choices: ['npm install', 'git push', 'node --version', 'psql --version'],
  },
  {
    text: 'Which constraint prevents duplicate values across columns?',
    choices: ['UNIQUE', 'DEFAULT', 'CHECK', 'NOT NULL'],
  },
  {
    text: 'Which HTTP status commonly indicates a resource was created?',
    choices: ['201', '301', '404', '503'],
  },
];

function makeSchoolId(number) {
  return `2099-${String(number).padStart(4, '0')}`;
}

async function selectRows(
  queryInterface,
  Sequelize,
  sql,
  replacements,
  transaction,
) {
  return queryInterface.sequelize.query(sql, {
    replacements,
    type: Sequelize.QueryTypes.SELECT,
    transaction,
  });
}

function makeAnswers(playerIndex, isFinishedRedPlayer) {
  // Three Red players finish with 14 correct answers.
  if (isFinishedRedPlayer) {
    return Array.from({ length: 14 }, (_, index) => ({
      round: index + 1,
      choiceIndex: 0,
      isCorrect: true,
    }));
  }

  // Remaining players only answer four questions before the early ending.
  return Array.from({ length: 4 }, (_, index) => {
    const round = index + 1;
    const isCorrect = (playerIndex + round) % 3 !== 0;

    return {
      round,
      choiceIndex: isCorrect ? 0 : 1,
      isCorrect,
    };
  });
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Find the demo host.
      const [host] = await selectRows(
        queryInterface,
        Sequelize,
        `SELECT user_id, school_id
         FROM users
         WHERE school_id = :schoolId AND role = 'HOST'
         LIMIT 1`,
        { schoolId: HOST_SCHOOL_ID },
        transaction,
      );

      if (!host) {
        throw new Error(
          'Demo host not found. Run demo-users first.',
        );
      }

      // 2. Find the 30 demo player accounts.
      const playerSchoolIds = Array.from(
        { length: 30 },
        (_, index) => makeSchoolId(index + 2),
      );

      const users = await selectRows(
        queryInterface,
        Sequelize,
        `SELECT user_id, school_id, role
         FROM users
         WHERE school_id IN (:schoolIds)
         ORDER BY school_id`,
        { schoolIds: playerSchoolIds },
        transaction,
      );

      if (
        users.length !== 30 ||
        users.some((user) => user.role !== 'PLAYER')
      ) {
        throw new Error(
          'Expected 30 demo players. Run demo-users first.',
        );
      }

      // 3. Find or create the question set.
      let [questionSet] = await selectRows(
        queryInterface,
        Sequelize,
        `SELECT question_set_id
         FROM question_sets
         WHERE host_id = :hostId AND title = :title
         ORDER BY question_set_id
         LIMIT 1`,
        {
          hostId: host.user_id,
          title: QUESTION_SET_TITLE,
        },
        transaction,
      );

      if (!questionSet) {
        await queryInterface.bulkInsert(
          'question_sets',
          [{
            host_id: host.user_id,
            title: QUESTION_SET_TITLE,
            description:
              'Fictional questions for the Board Wars Week 10 demo.',
            subject: 'Computer Science',
            grade_level: 'College',
            created_at: STARTED_AT,
          }],
          { transaction },
        );

        [questionSet] = await selectRows(
          queryInterface,
          Sequelize,
          `SELECT question_set_id
           FROM question_sets
           WHERE host_id = :hostId AND title = :title
           ORDER BY question_set_id
           LIMIT 1`,
          {
            hostId: host.user_id,
            title: QUESTION_SET_TITLE,
          },
          transaction,
        );
      }

      // 4. Insert questions.
      const questionRows = QUESTIONS.map((question, index) => ({
        question_set_id: questionSet.question_set_id,
        text: question.text,
        type: 'multiple_choice',
        correct_index: 0,
        time_limit_sec: 30,
        order_index: index + 1,
        created_at: STARTED_AT,
      }));

      await queryInterface.bulkInsert(
        'questions',
        questionRows,
        {
          transaction,
          ignoreDuplicates: true,
        },
      );

      const savedQuestions = await selectRows(
        queryInterface,
        Sequelize,
        `SELECT question_id, order_index
         FROM questions
         WHERE question_set_id = :questionSetId
         ORDER BY order_index`,
        { questionSetId: questionSet.question_set_id },
        transaction,
      );

      const questionIdByRound = new Map(
        savedQuestions.map((row) => [
          Number(row.order_index),
          Number(row.question_id),
        ]),
      );

      if (questionIdByRound.size !== QUESTIONS.length) {
        throw new Error(
          'Could not retrieve all demo questions.',
        );
      }

      // 5. Insert four choices for each question.
      const choiceRows = [];

      QUESTIONS.forEach((question, questionIndex) => {
        const questionId = questionIdByRound.get(questionIndex + 1);

        question.choices.forEach((choiceText, choiceIndex) => {
          choiceRows.push({
            question_id: questionId,
            choice_index: choiceIndex,
            choice_text: choiceText,
          });
        });
      });

      await queryInterface.bulkInsert('choices', choiceRows, {
        transaction,
        ignoreDuplicates: true,
      });

      const questionIds = [...questionIdByRound.values()];

      const savedChoices = await selectRows(
        queryInterface,
        Sequelize,
        `SELECT choice_id, question_id, choice_index
         FROM choices
         WHERE question_id IN (:questionIds)`,
        { questionIds },
        transaction,
      );

      const choiceIdByQuestionAndIndex = new Map(
        savedChoices.map((row) => [
          `${Number(row.question_id)}:${Number(row.choice_index)}`,
          Number(row.choice_id),
        ]),
      );

      // 6. Find or create the demo game session.
      let [gameSession] = await selectRows(
        queryInterface,
        Sequelize,
        `SELECT session_id
         FROM game_sessions
         WHERE join_code = :joinCode
         LIMIT 1`,
        { joinCode: DEMO_JOIN_CODE },
        transaction,
      );

      if (!gameSession) {
        await queryInterface.bulkInsert(
          'game_sessions',
          [{
            host_id: host.user_id,
            question_set_id: questionSet.question_set_id,
            join_code: DEMO_JOIN_CODE,
            status: 'finished',
            current_round: 15,
            current_question_id: questionIdByRound.get(15),
            winner_team: null,
            created_at: STARTED_AT,
            started_at: STARTED_AT,
            ended_at: ENDED_AT,
          }],
          {
            transaction,
            ignoreDuplicates: true,
          },
        );

        [gameSession] = await selectRows(
          queryInterface,
          Sequelize,
          `SELECT session_id
           FROM game_sessions
           WHERE join_code = :joinCode
           LIMIT 1`,
          { joinCode: DEMO_JOIN_CODE },
          transaction,
        );
      }

      if (!gameSession) {
        throw new Error('Could not find or create the demo game.');
      }

      const sessionId = Number(gameSession.session_id);

      // 7. Create one seat for each player account.
      const seatRowsToInsert = users.map((user, index) => ({
        game: sessionId,
        user_id: Number(user.user_id),
        seat_number: index + 1,
        joined_at: STARTED_AT,
      }));

      await queryInterface.bulkInsert(
        'seat',
        seatRowsToInsert,
        {
          transaction,
          ignoreDuplicates: true,
        },
      );

      const savedSeats = await selectRows(
        queryInterface,
        Sequelize,
        `SELECT seat_id, user_id
         FROM seat
         WHERE game = :sessionId`,
        { sessionId },
        transaction,
      );

      const seatIdByUserId = new Map(
        savedSeats.map((row) => [
          Number(row.user_id),
          Number(row.seat_id),
        ]),
      );

      // 8. Prepare Red and Blue team records.
      const playerSpecs = users.map((user, index) => {
        const positionInTeam = index % 15;
        const teamColor = index < 15 ? 'RED' : 'BLUE';
        const isFinished =
          teamColor === 'RED' && positionInTeam < 3;

        const answers = makeAnswers(index, isFinished);
        const correctAnswers = answers.filter(
          (answer) => answer.isCorrect,
        ).length;
        const wrongAnswers = answers.filter(
          (answer) => !answer.isCorrect,
        ).length;

        let rowPosition;

        if (isFinished) {
          rowPosition = 1;
        } else if (teamColor === 'RED') {
          rowPosition = 15 - correctAnswers;
        } else {
          rowPosition = 1 + correctAnswers;
        }

        return {
          userId: Number(user.user_id),
          seatId: seatIdByUserId.get(Number(user.user_id)),
          index,
          positionInTeam,
          teamColor,
          nickname:
            `${teamColor === 'RED' ? 'RedPawn' : 'BluePawn'}` +
            `${String(positionInTeam + 1).padStart(2, '0')}`,
          rowPosition,
          columnPosition: positionInTeam + 1,
          correctAnswers,
          wrongAnswers,
          isFinished,
          finishedAt: isFinished
            ? new Date(
                STARTED_AT.getTime() +
                4 * 60 * 1000 +
                positionInTeam * 15 * 1000,
              )
            : null,
          answers,
        };
      });

      if (playerSpecs.some((player) => !player.seatId)) {
        throw new Error(
          'One or more players are missing seats.',
        );
      }

      const sessionPlayerRows = playerSpecs.map((player) => ({
        seat_id: player.seatId,
        session_id: sessionId,
        nickname: player.nickname,
        team_color: player.teamColor,
        row_position: player.rowPosition,
        column_position: player.columnPosition,
        correct_answers: player.correctAnswers,
        wrong_answers: player.wrongAnswers,
        movement_available: false,
        finished: player.isFinished,
        finished_at: player.finishedAt,
      }));

      await queryInterface.bulkInsert(
        'session_players',
        sessionPlayerRows,
        {
          transaction,
          ignoreDuplicates: true,
        },
      );

      // 9. Get the generated session-player IDs from PostgreSQL.
      const savedPlayers = await selectRows(
        queryInterface,
        Sequelize,
        `SELECT session_player_id, seat_id
         FROM session_players
         WHERE session_id = :sessionId`,
        { sessionId },
        transaction,
      );

      const sessionPlayerIdBySeatId = new Map(
        savedPlayers.map((row) => [
          Number(row.seat_id),
          Number(row.session_player_id),
        ]),
      );

      // 10. Insert each player's answer history.
      const answerRows = [];

      for (const player of playerSpecs) {
        const sessionPlayerId =
          sessionPlayerIdBySeatId.get(player.seatId);

        if (!sessionPlayerId) {
          throw new Error(
            `Missing session-player record for ${player.nickname}.`,
          );
        }

        for (const answer of player.answers) {
          const questionId = questionIdByRound.get(answer.round);

          const choiceId = choiceIdByQuestionAndIndex.get(
            `${questionId}:${answer.choiceIndex}`,
          );

          if (!choiceId) {
            throw new Error(
              `Missing choice for round ${answer.round}.`,
            );
          }

          answerRows.push({
            session_player_id: sessionPlayerId,
            question_id: questionId,
            choice_id: choiceId,
            round_number: answer.round,
            is_correct: answer.isCorrect,
            answered_at: new Date(
              STARTED_AT.getTime() +
              answer.round * 15000 +
              player.index * 1000,
            ),
          });
        }
      }

      await queryInterface.bulkInsert('answers', answerRows, {
        transaction,
        ignoreDuplicates: true,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete the demo game and its dependent records.
      const sessions = await selectRows(
        queryInterface,
        Sequelize,
        `SELECT session_id
         FROM game_sessions
         WHERE join_code = :joinCode`,
        { joinCode: DEMO_JOIN_CODE },
        transaction,
      );

      for (const session of sessions) {
        const sessionId = Number(session.session_id);

        await queryInterface.sequelize.query(
          `DELETE FROM answers
           WHERE session_player_id IN (
             SELECT session_player_id
             FROM session_players
             WHERE session_id = :sessionId
           )`,
          {
            replacements: { sessionId },
            transaction,
          },
        );

        await queryInterface.sequelize.query(
          'DELETE FROM session_players WHERE session_id = :sessionId',
          {
            replacements: { sessionId },
            transaction,
          },
        );

        await queryInterface.sequelize.query(
          'DELETE FROM seat WHERE game = :sessionId',
          {
            replacements: { sessionId },
            transaction,
          },
        );

        await queryInterface.sequelize.query(
          'DELETE FROM game_sessions WHERE session_id = :sessionId',
          {
            replacements: { sessionId },
            transaction,
          },
        );
      }

      // Delete this demo question set and its related questions/choices.
      const [host] = await selectRows(
        queryInterface,
        Sequelize,
        `SELECT user_id
         FROM users
         WHERE school_id = :schoolId
         LIMIT 1`,
        { schoolId: HOST_SCHOOL_ID },
        transaction,
      );

      if (host) {
        const questionSets = await selectRows(
          queryInterface,
          Sequelize,
          `SELECT question_set_id
           FROM question_sets
           WHERE host_id = :hostId AND title = :title`,
          {
            hostId: host.user_id,
            title: QUESTION_SET_TITLE,
          },
          transaction,
        );

        for (const set of questionSets) {
          const questionSetId = Number(set.question_set_id);

          await queryInterface.sequelize.query(
            `DELETE FROM choices
             WHERE question_id IN (
               SELECT question_id FROM questions
               WHERE question_set_id = :questionSetId
             )`,
            {
              replacements: { questionSetId },
              transaction,
            },
          );

          await queryInterface.sequelize.query(
            'DELETE FROM questions WHERE question_set_id = :questionSetId',
            {
              replacements: { questionSetId },
              transaction,
            },
          );

          await queryInterface.sequelize.query(
            'DELETE FROM question_sets WHERE question_set_id = :questionSetId',
            {
              replacements: { questionSetId },
              transaction,
            },
          );
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};