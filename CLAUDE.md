# Loci — Agent Rules

## Git Conventions

- Author commits as `Claude <noreply@anthropic.com>` via `git -c user.name='Claude' -c user.email='noreply@anthropic.com' commit`
- If env vars `GITHUB_AUTHOR_NAME` and `GITHUB_AUTHOR_EMAIL` are set, add `Co-authored-by: $GITHUB_AUTHOR_NAME <$GITHUB_AUTHOR_EMAIL>` trailer

## Architecture

Electron app: `src/main/` (Node/SQLite backend) · `src/renderer/` (React/Vite frontend) · `src/preload/` (contextBridge only).
Renderer must not import from `src/main/` or `src/preload/` — communicates exclusively via `window.loci.*`.

## Always-enforced rules

- **Exported types → `src/main/entities/` only.** Never export types from repos, managers, agents, or IPC files. Internal-only types stay inline in the function signature.
- **Non-exported helper functions → end of file, after all exports.**
- **`AppContext`** (`src/main/entities/app-context.ts`) instead of bare `db: Knex` everywhere in `src/main/`.

See `.claude/rules/` for layer-specific conventions.
