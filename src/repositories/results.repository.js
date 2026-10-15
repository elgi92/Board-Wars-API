// Hub Contract rule 7: Results endpoint query for Board Wars.

const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

async function findFinishedGamePlayers(since) {
  const sql = `
    SELECT
      gs.join_code AS session_code,
      gs.started_at,
      gs.ended_at,
      u.school_id,
      sp.nickname,
      sp.correct_answers AS score,
      sp.finished AS completed
    FROM game_sessions AS gs
    JOIN seat AS st
      ON st.game = gs.session_id
    JOIN users AS u
      ON u.user_id = st.user_id
    JOIN session_players AS sp
      ON sp.seat_id = st.seat_id
      AND sp.session_id = gs.session_id
    WHERE gs.status = 'finished'
      AND gs.ended_at IS NOT NULL
      AND (
        CAST(:since AS timestamptz) IS NULL
        OR gs.ended_at > CAST(:since AS timestamptz)
      )
    ORDER BY
      gs.ended_at DESC,
      sp.correct_answers DESC,
      sp.wrong_answers ASC;
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      since: since ? since.toISOString() : null,
    },
  });
}

module.exports = { findFinishedGamePlayers };