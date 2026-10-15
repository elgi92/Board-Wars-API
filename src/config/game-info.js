// What the Library Game Hub shows about YOUR game (Hub Contract, rule 1).
// Lab Step 6: replace every CHANGE_ME value with your own.
const pkg = require('../../package.json');

module.exports = {
  slug: 'board-wars',            // your group's game, lower case with hyphens, for example shelf-climb
  name: 'Board Wars',            // the name players will see
  team: 'Group 11(3-2)',            // your group's name and section, for example Bookworms (3-1)
  developer: 'elgi92',       // YOUR GitHub username: this build is yours
  description: '**Board Wars** is a multiplayer quiz strategy game where players are randomly assigned to the Red or Blue Team, answer questions to earn one-tile movements, and strategically move and block opponents across a 15×15 board until one team gets all 15 players to the opposite side.',     // one sentence about how the game is played
  min_players: 1,               // change to the limits your game is designed for
  max_players: 30,
  version: pkg.version,         // read from package.json, do not edit here
};
