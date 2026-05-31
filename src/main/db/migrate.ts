import type { Knex } from 'knex'
import * as initial from './migrations/001_initial'

interface Migration {
	name: string
	up: (db: Knex) => Promise<void>
}

const migrations: Migration[] = [{ name: '001_initial', up: initial.up }]

export async function runMigrations(db: Knex): Promise<void> {
	await db.raw(
		`CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))`,
	)

	for (const migration of migrations) {
		const applied = await db('migrations').where({ name: migration.name }).first()
		if (applied) {
			continue
		}

		await migration.up(db)
		await db('migrations').insert({ name: migration.name })
	}
}
