# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: a team-retrospective app — a pastel three-column sticky board (add +
vote) and an action tracker (owner + done), per named sprint. Vite + React 19 +
`@hanzo/gui` + `@hanzo/iam` + `@hanzo/base`. Keep it minimal and real.
`@hanzo/gui` needs the react-native-web alias + Tamagui defines in
`vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this).
`schema.sql` (`retros`/`cards`/`actions`) is the Base data contract; keep it in
lockstep with `src/lib/retro.ts`. Prove changes with `npm run build` (tsc +
vite). Never build a container image locally — Hanzo Cloud owns deploys.
