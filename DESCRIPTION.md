# Loci

Loci is a local-first desktop application that acts as a personal knowledge assistant. It is both reactive (answer questions using accumulated memory) and proactive (autonomously generate insights, summaries, and questions in the background). All data stays on the user's machine. No cloud hosting. No API key required — uses the Claude Code CLI as a subprocess.

## How It Is Organised

- `src/main/index.ts` — Electron main process entry; creates the window, initialises the database, registers IPC handlers, and starts the background agent
- `src/main/config.ts` — Static bootstrap config (data directory, database path); loaded before the database exists
- `src/main/db/` — Knex instance creation, migration runner, and migration files
- `src/main/entities/` — Shared exported domain types (Topic, Note, Conversation, Message, Insight, Setting)
- `src/main/repositories/` — Knex persistence functions only; one file per domain
- `src/main/managers/` — Domain orchestration (validation, normalisation, multi-step workflows)
- `src/main/claude/` — Claude CLI subprocess helpers (streaming and non-streaming)
- `src/main/agent/` — Background agent (node-cron jobs for daily summaries and weekly synthesis)
- `src/main/ipc/` — Electron IPC handler registration; bridges main process logic to the renderer
- `src/preload/index.ts` — contextBridge exposure; defines the `window.loci` API surface for the renderer
- `src/renderer/` — React + Vite UI (hash routing, six views: Dashboard, Ask, Topics, Notes, Insights, Settings)
- `tests/` — Vitest unit tests

## Runtime Flow

On startup, `main/index.ts` reads the static config, ensures the data directory exists, opens the SQLite database (WAL mode), runs pending migrations, creates the browser window, registers all IPC handlers, and starts the background agent scheduler.

The renderer communicates exclusively via `window.loci.*` calls (contextBridge), which map to `ipcRenderer.invoke` and `ipcRenderer.on` under the hood. The main process handles every IPC channel and owns all database access and Claude CLI invocations.

Streaming responses (Ask view) use `ipcMain.handle` to start the Claude subprocess and `mainWindow.webContents.send('ask:token', text)` to push individual tokens to the renderer as they arrive.

The background agent uses `node-cron` to schedule a daily summary job and a weekly synthesis job. Both spawn non-streaming Claude calls, persist the results as `insights`, send an `insights:updated` IPC event to the renderer, and fire an Electron `Notification`.

## Prerequisite for Users

Claude Code CLI installed and authenticated (`claude` available in PATH or configured in Settings).
