---
paths:
  - 'src/**'
---

# Code Style — `src/`

Applies to all TypeScript/TSX across the whole codebase (backend and frontend).

- Prefer functional programming — no classes, no factory functions returning method objects
- Named function declarations for exported and module-level functions; arrow functions only for callbacks, inline behaviour, array/promise methods, object/JSX properties, and event handlers
- Use `type` instead of `interface` for all type definitions
- Use `import { ... }` — never `import type { ... }`
- Always put a blank line after an `if` block that is followed by more code
- Do not create a named type just to export it — if a type is only used in one function signature, inline it there
