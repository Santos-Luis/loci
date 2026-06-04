# Loci

A local-first AI agent that remembers what you care about and thinks while you don't.

Loci is a desktop app that answers questions grounded in your own notes, conversations, and
generated insights (reactive Q&A), and proactively produces daily summaries and weekly
cross-topic syntheses in the background (a proactive agent). All data stays on your machine.
No cloud, no API key — Loci drives the Claude Code CLI as a subprocess.

## Prerequisites

- Node.js 20+
- [Claude Code CLI](https://docs.claude.com/en/docs/claude-code) installed and authenticated
  (`claude` available in your PATH, or set the path in Settings)

## Develop

```bash
npm install
npm run rebuild:electron   # build better-sqlite3 for the Electron ABI
npm run dev
```

> Note: tests run under Node, the app runs under Electron, and `better-sqlite3` is a native
> module. Use `npm run rebuild:electron` before `npm run dev`, and `npm run rebuild:node`
> before `npm test`.

## Test, typecheck, lint

```bash
npm test
npm run typecheck
npm run lint
```

## Package

```bash
npm run package
```

Produces a `.dmg` (macOS) or NSIS installer (Windows) in `dist/`.

## Data

All data lives in `~/.loci/loci.sqlite` (override with the `LOCI_DATA_DIR` environment
variable). Nothing is sent anywhere except the local `claude` subprocess. No telemetry.

## License

MIT — see [LICENSE](./LICENSE).
