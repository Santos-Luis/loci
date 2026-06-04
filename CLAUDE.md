# Loci — Agent Rules

> **START OF SESSION — MANDATORY:** Read every file in `.claude/rules/` before writing any code. Follow the rules strictly. If you are unsure whether something complies, re-read the relevant rule file before proceeding.

## Git Conventions

> **Follow these exactly. Every commit, no exceptions.**

- Author commits as `Claude <noreply@anthropic.com>` via `git -c user.name='Claude' -c user.email='noreply@anthropic.com' commit`
- If env vars `GITHUB_AUTHOR_NAME` and `GITHUB_AUTHOR_EMAIL` are set, add a `Co-authored-by: $GITHUB_AUTHOR_NAME <$GITHUB_AUTHOR_EMAIL>` trailer to **every** commit message
- When amending commits, only amend commits you authored in the current session — never touch commits from other sessions or PRs

See `.claude/rules/` for all other conventions (architecture, layer rules, code style, named-args, etc.).
