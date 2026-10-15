'use strict';

const HOST_SCHOOL_ID = '2099-0001';

function makeSchoolId(number) {
  return `2099-${String(number).padStart(4, '0')}`;
}

function makeSeedUsers() {
  const createdAt = new Date('2026-10-15T00:00:00.000Z');

  const users = [
    {
      school_id: HOST_SCHOOL_ID,
      full_name: 'Board Wars Demo Host',
      email: 'host.2099-0001@boardwars.test',
      role: 'HOST',
      created_at: createdAt,
    },
  ];

  // Create 30 fictional players.
  for (let number = 1; number <= 30; number += 1) {
    const schoolId = makeSchoolId(number + 1);

    users.push({
      school_id: schoolId,
      full_name: `Demo Player ${String(number).padStart(2, '0')}`,
      email: `player.${schoolId}@boardwars.test`,
      role: 'PLAYER',
      created_at: createdAt,
    });
  }

  // Required awkward case: account exists but never joined a game.
  users.push({
    school_id: '2099-0032',
    full_name: 'Demo Player Never Joined',
    email: 'player.2099-0032@boardwars.test',
    role: 'PLAYER',
    created_at: createdAt,
  });

  return users;
}

module.exports = {
  async up(queryInterface) {
    const users = makeSeedUsers();

    // Safe to run again: unique conflicts are ignored.
    await queryInterface.bulkInsert('users', users, {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface) {
    const schoolIds = Array.from(
      { length: 32 },
      (_, index) => makeSchoolId(index + 1),
    );

    schoolIds[0] = HOST_SCHOOL_ID;

    await queryInterface.sequelize.query(
      'DELETE FROM users WHERE school_id IN (:schoolIds)',
      {
        replacements: { schoolIds },
      },
    );
  },
};