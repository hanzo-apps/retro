-- Hanzo Base schema for Sprint Retro — the `databaseSchema` DDL.
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- id/created/updated/owner/org itself, so they are never re-declared here.
-- Every row is stamped with the verified IAM owner+org and is org-scoped: Base
-- applies the list/view/create/update/delete rule `@request.auth.org_id = org`,
-- so a member of your org reads/writes the row and other orgs cannot see it.
--
-- Keep this in lockstep with what the app reads/writes
-- (src/lib/retro.ts + src/views/board.tsx · actions.tsx · home.tsx).

-- One retrospective per sprint. `sprint` is the display name ("Sprint 24").
CREATE TABLE IF NOT EXISTS retros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sprint TEXT NOT NULL
);

-- Sticky-note cards on the board. `retro` links to a retros.id; `column` is one
-- of 'well' | 'improve' | 'action'; `votes` is a running count.
CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retro  TEXT NOT NULL,
  column TEXT NOT NULL DEFAULT 'well',
  text   TEXT NOT NULL,
  votes  INTEGER NOT NULL DEFAULT 0
);

-- Tracked actions for a retro — the follow-through. `owner` is a free-text
-- assignee; `done` flips when the commitment lands.
CREATE TABLE IF NOT EXISTS actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retro TEXT NOT NULL,
  text  TEXT NOT NULL,
  owner TEXT NOT NULL DEFAULT '',
  done  BOOLEAN NOT NULL DEFAULT 0
);
