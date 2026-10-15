# BOARD WARS API

Backend API for **Board Wars**, a tournament game for the SorSU Bulan Campus library.
CS 313 Software Engineering 1, A.Y. 2026-2027.

- Developer: Luigi Miguel T. Gapsi (elgi92), BSCS [3-2]
- Group and game concept: [Group 11 - Board Wars]

This is my own build of my group's game concept. Every commit in this repository was made by me, with Git, on my own computer or in my own Codespace.

## Tech stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 22 LTS or newer |
| Web framework | Express 5 |
| Database | PostgreSQL 16 or newer |
| ORM and migrations | Sequelize 6 with sequelize-cli |

## Setup

```
git clone [repository-url]
cd [folder-name]
npm install
```

Copy `.env.example` to `.env`, then put your own PostgreSQL password in `DB_PASSWORD`.

```
npm run db:create     (first time only)
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

## Environment variables

| Key | Example | Purpose |
|---|---|---|
| NODE_ENV | development | Which config block to use |
| PORT | 3001 | Port the API listens on (the library assigns the final port at deployment) |
| DB_HOST | 127.0.0.1 | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | your_game_slug | Database name: your game slug, with underscores |
| DB_USER | postgres | Database user |
| DB_PASSWORD | (your own) | Database password. Never commit this. |
| HUB_API_KEY | dev-hub-key | Key the Library Game Hub sends to read results. The library gives the real one at deployment. |

## Endpoints (Hub Contract v1.2)

Base URL: `http://localhost:3001/api/v1`

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | /health | Is the API up and can it reach the database? | 200 (503 when the database is down) |
| GET | /game-info | Slug, name, group, developer, description, player limits, version | 200 |
| GET | /results | Finished games, every player, and the top 3. Needs the `X-Hub-Key` header. Optional `?since=` | 200 (401 without the key) |

## What "completed" means in my game

A player is considered to have completed Board Wars when their pawn
reaches the opposing edge of the 15 × 15 board. This is recorded in
the database by setting `finished` to `TRUE` and saving `finished_at`.
Players who do not reach the opposing edge before the game ends are
included in the results with `completed` set to `false`.

## Tables

1. `users` — Stores user accounts, school IDs, names, emails, and roles.
2. `question_sets` — Stores question-set information and the host who created it.
3. `questions` — Stores questions, question types, correct answer indexes, and time limits.
4. `choices` — Stores the answer choices for each question.
5. `game_sessions` — Stores game sessions, join codes, status, current round, and winning team.
6. `seat` — Links a user account to a game session and prevents duplicate seats.
7. `session_players` — Stores player nicknames, Red or Blue team assignment, pawn positions, answer counts, and finish status.
8. `answers` — Stores submitted answers, selected choices, correctness, and submission timestamps.

## Database scripts

| Command | What it does |
|---|---|
| npm run db:migrate | Runs migrations that have not run yet |
| npm run db:migrate:status | Lists every migration as up or down |
| npm run db:seed | Loads the seed data |
| npm run db:check | Counts the rows in every table |
| npm run db:reset | Empties the database, rebuilds every table and reloads the seed data |
| npm run check | Runs the same automatic check that GitHub runs after every push |
