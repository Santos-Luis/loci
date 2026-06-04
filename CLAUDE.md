# Loci — Agent Rules

This file captures durable project rules for agents working in this repository.

## Git Conventions

- Author commits as `Claude <noreply@anthropic.com>` — always set `user.name` and `user.email` via `git -c user.name='Claude' -c user.email='noreply@anthropic.com' commit ...`
- If env vars `GITHUB_AUTHOR_NAME` and `GITHUB_AUTHOR_EMAIL` are available, add a `Co-authored-by` trailer to every commit:
  ```
  Co-authored-by: $GITHUB_AUTHOR_NAME <$GITHUB_AUTHOR_EMAIL>
  ```

## Architecture Boundaries

- Put database access code under `src/main/repositories/`
- Put shared exported domain types under `src/main/entities/`
- Put domain logic and validation under `src/main/managers/`
- Put Claude CLI subprocess helpers under `src/main/claude/`
- Put background agent scheduling under `src/main/agent/`
- Put Electron IPC handler registration under `src/main/ipc/`
- Keep `src/main/index.ts` as the Electron composition root
- Keep `src/preload/index.ts` as the only file that touches `ipcRenderer` and `contextBridge`
- The renderer (`src/renderer/`) must not import anything from `src/main/` or `src/preload/`
- The renderer communicates with the main process exclusively via `window.loci.*`

## Type Placement

- **Exported types live under `src/main/entities/` by domain — no exceptions.** Never export a type from a repository, manager, agent, or IPC file; only import from entities.
- Do not export entity types from repositories, managers, or other layers — import from entities only
- DB row types (`TopicRow`, `NoteRow`, etc.) live in their entity file alongside the camelCase domain type — not in the repository file
- The renderer's `src/renderer/src/lib/types.ts` mirrors the relevant entity types for the UI layer; keep them in sync manually
- If a type is only needed internally (not used by callers), do not export it at all — inline it directly in the function signature

## Programming Style

- Prefer functional programming
- Export plain stateless named functions with explicit arguments and dependencies
- Do not use arrow functions for file-level exported or module-level functions (use named function declarations)
- Use arrow functions for callbacks, inline behaviour, array/promise methods, object/JSX properties, event handlers
- No classes or factory functions returning method objects
- Use `type` instead of `interface` for all type definitions
- Use plain `import { ... }` — never `import type { ... }`
- Pass dependencies via an `AppContext` object (`src/main/entities/app-context.ts`, `{ db: Knex }`), never bare `db: Knex`
- If a function has exactly 1 argument, take it directly (e.g. `listTopics(ctx: AppContext)`)
- If a function has more than 1 argument, wrap ALL of them — including `ctx` — in a single destructured named-args object:
  - ✅ `createTopic({ ctx, name, description }: { ctx: AppContext; name: string; description: string | null })`
  - ❌ `createTopic(ctx: AppContext, { name, description })` — do not split ctx from data args
- Always put a blank line after an `if` block that is followed by more code

## Repository Conventions

- Repositories are focused on persistence only — no validation, no orchestration
- Each repository function receives an `AppContext` object (never bare `db: Knex`) following the named-args convention above
- **Non-exported helper functions go at the end of the file, after all exports — not at the top.** This applies everywhere (repositories, managers, agents, IPC), not just repositories.
- Use a separate `const` for each awaited intermediate value — do not nest awaits inside function call arguments
- Boolean columns stored as integers (0/1) must be normalised at the repository boundary

## Manager Conventions

- Managers orchestrate domain workflows and accept dependencies explicitly
- Validation and normalisation belong in managers, not repositories
- Managers depend on plain functions and plain data, not stateful service objects

## IPC Conventions

- Every channel name follows the pattern `domain:action` (e.g. `topics:list`, `ask:send`)
- `ipcMain.handle` is used for request/response (invoke/handle pattern)
- `mainWindow.webContents.send` is used for push events from main to renderer (e.g. `ask:token`, `insights:updated`)
- The preload exposes `on*` methods that return a cleanup function (removes the listener)

## File and Function Design

- Favour small, focused files with one clear purpose
- Keep boundaries easy to understand and test independently

## Database

- Use Knex for all queries and migrations
- Migrations live in `src/main/db/migrations/` and are registered explicitly in `src/main/db/migrate.ts` (no directory scanning)
- FTS5 virtual tables and their sync triggers are created in migration SQL via `db.raw()`
- WAL mode is enabled at startup in `src/main/db/knex.ts`
- Default settings are seeded in the initial migration

## Claude CLI

- Streaming responses (Ask view): `claude -p "<prompt>" --output-format stream-json --model <model>`
- Non-streaming responses (background jobs): `claude -p "<prompt>" --output-format json --model <model>`
- Never hard-code the `claude` binary path — always read it from settings (`claude_path`)
