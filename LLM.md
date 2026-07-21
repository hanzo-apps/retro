# Sprint Retro (sprint-retro) — agent notes

A team-retrospective app, forked from the canonical Hanzo starter.
Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data).
Keep it REAL — every surface must build and run, no fabricated UI.

## The app

- **Retro board** (`src/views/board.tsx`) — three calm pastel columns of
  sticky-note cards (Went Well · To Improve · Action Items). Each column has an
  inline composer and its cards; a card shows text, a vote pill, and (on Action
  Items) a `Track →` that promotes it into the actions collection. Cards sort
  most-voted first (`cardsIn`).
- **Action tracker** (`src/views/actions.tsx`) — the follow-through: `actions`
  with a free-text `owner` and a `done` toggle (a Button, not a Checkbox), plus
  a progress bar (`progressIn`).
- **Signed-in shell** (`src/views/home.tsx`) — brand bar, a sprint switcher
  (`retros`), and Board / Actions tabs for the current retro. First run shows a
  "start your first retro" empty state.
- **Landing** (`src/views/signed-out.tsx`) — the honest public view; an
  illustrative preview board (same sticky styling, not live data) + the PKCE
  sign-in. This is the catalog thumbnail.
- `src/lib/retro.ts` — types, the pastel `COLUMNS`, ink/paper constants, and the
  `cardsIn`/`actionsIn`/`progressIn`/`votesIn`/`isDone` helpers. One place for
  retro logic.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam scopes every
  `useQuery`/`useMutation` to the signed-in user's org. The design system runs
  in its **light** theme (`defaultTheme="light"`) for the pastel board.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`. The
  IAM client id is `VITE_HANZO_CLIENT_ID` (fallback `hanzo-app`).
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind).

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web. No Tamagui compiler,
  no `one`, no Expo.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`paddingHorizontal`/
  `alignSelf`/`borderRadius`/`borderTopWidth`/`textAlign` — NOT the
  `items`/`justify`/`bg`/`p`/`px`/`self`/`rounded`/`text` shorthands. Shorthands
  pass at runtime but FAIL `tsc`. `Button`/pressables use `onPress`;
  `Input`/`TextArea` use `value`/`onChangeText`. Pastel hues are raw hex strings
  (`#5b6ce0`, alpha tints like `#5b6ce022`) — Tamagui accepts them.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into Base collections (`provisionBaseFromDDL`). Keep it in
  lockstep with `src/lib/retro.ts` + the views. `cards.retro`/`actions.retro`
  hold the owning `retros.id`; scoping to a retro is client-side by that id.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage. No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native). Runtime read/write is browser → `VITE_HANZO_BASE_URL`
  with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback`. The deploy provisions a per-app `hanzo-<app>` client.

## Proven

`npm run typecheck` (tsc --noEmit) clean · `npm run build` (tsc + vite) →
`dist/` · the landing renders under headless Chrome at 1280×800 with the
branded hero + pastel preview board. `login()` performs a real PKCE S256
redirect to hanzo.id.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
