---
paths:
  - 'src/main/repositories/**'
  - 'src/main/managers/**'
  - 'src/main/ipc/**'
---

# Repository, Manager & IPC Conventions

## Repositories — `src/main/repositories/`

- Persistence only — no validation, no orchestration
- Use a separate `const` for each awaited intermediate value; do not nest awaits inside call arguments
- Boolean columns stored as integers (0/1) must be normalised to `boolean` at the repository boundary
- DB row types (`TopicRow`, `NoteRow`, etc.) live in the corresponding `src/main/entities/` file, not in the repository file

## Managers — `src/main/managers/`

- Orchestrate domain workflows; validation and normalisation belong here, not in repositories
- Depend on plain functions and plain data, not stateful service objects

## IPC — `src/main/ipc/`

- Channel names follow `domain:action` (e.g. `topics:list`, `ask:send`)
- `ipcMain.handle` for request/response (invoke/handle pattern)
- `mainWindow.webContents.send` for push events from main → renderer (e.g. `ask:token`, `insights:updated`)
- Preload `on*` methods return a cleanup function that removes the listener
