# Database Conventions — `src/main/db/`

- Use Knex for all queries and migrations
- Migrations live in `src/main/db/migrations/` and are registered **explicitly** in `src/main/db/migrate.ts` — no directory scanning
- FTS5 virtual tables and their sync triggers are created in migration SQL via `db.raw()`
- WAL mode is enabled at startup in `src/main/db/knex.ts`
- Default settings are seeded in the initial migration
