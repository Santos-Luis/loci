# Backend Conventions — `src/main/`

## Layer responsibilities

- `entities/` — exported domain types; the single source of truth imported by every other layer
- `repositories/` — persistence only; no validation, no orchestration
- `managers/` — domain logic, validation, orchestration; depend on plain functions, not stateful objects
- `claude/` — Claude CLI subprocess helpers
- `agent/` — background job scheduling
- `ipc/` — IPC handler registration; must never `import 'electron'` — Electron objects are passed in from `src/main/index.ts`
- `index.ts` — composition root (the only file that imports `'electron'`)

## Named-args convention

- Exactly 1 argument → take it directly: `fn(ctx: AppContext)`
- More than 1 argument → wrap ALL (including `ctx`) in one destructured object:
  - ✅ `fn({ ctx, name }: { ctx: AppContext; name: string })`
  - ❌ `fn(ctx: AppContext, name: string)` — never split ctx from data args
