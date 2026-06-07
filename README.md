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

### First-time setup (or after switching OS/machine)

Native modules (`better-sqlite3`, Electron) are compiled for a specific platform and Node ABI.
When cloning on a new machine — or after switching between Windows and macOS — delete any
existing lock file and reinstall from scratch:

```bash
# Remove stale artifacts (run from the repo root)
rm -f package-lock.json
rm -rf node_modules

npm install

# Ensure the Electron binary was downloaded
# (re-run this if you see "Error: Electron uninstall" on npm run dev)
node node_modules/electron/install.js

# Compile better-sqlite3 against Electron's Node ABI
npm run rebuild:electron
```

### Start the dev server

```bash
npm run dev
```

> `better-sqlite3` is a native module with two ABIs in play: Electron's (for the app) and
> plain Node's (for tests). Use `npm run rebuild:electron` before `npm run dev`, and
> `npm run rebuild:node` before `npm test`.

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
