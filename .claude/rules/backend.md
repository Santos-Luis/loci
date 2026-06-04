---
paths:
  - 'src/main/**'
---

# Backend Conventions — `src/main/`

## Architecture

Electron app: `src/main/` (Node/SQLite backend) · `src/renderer/` (React/Vite frontend) · `src/preload/` (contextBridge only).
Renderer must not import from `src/main/` or `src/preload/` — communicates exclusively via `window.loci.*`.

## Layer responsibilities

- `entities/` — exported domain types; the single source of truth imported by every other layer
- `repositories/` — persistence only; no validation, no orchestration
- `managers/` — domain logic, validation, orchestration; depend on plain functions, not stateful objects
- `claude/` — Claude CLI subprocess helpers
- `agent/` — background job scheduling
- `ipc/` — IPC handler registration; must never `import 'electron'` — Electron objects are passed in from `src/main/index.ts`
- `index.ts` — composition root (the only file that imports `'electron'`)

## Always-enforced rules

- **Exported types → `src/main/entities/` only.** Never export types from repos, managers, agents, or IPC files. Internal-only types stay inline in the function signature.
- **Non-exported helper functions → end of file, after all exports.**
- **`AppContext`** (`src/main/entities/app-context.ts`) instead of bare `db: Knex` everywhere in `src/main/`.

## Named-args convention

- Exactly 1 argument → take it directly: `fn(ctx: AppContext)`
- More than 1 argument → wrap ALL (including `ctx`) in one destructured object:
  - ✅ `fn({ ctx, name }: { ctx: AppContext; name: string })`
  - ❌ `fn(ctx: AppContext, name: string)` — never split ctx from data args
