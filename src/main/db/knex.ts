import knex, { Knex } from 'knex';

export function createDb(filename: string): Knex {
	return knex({
		client: 'better-sqlite3',
		connection: { filename },
		useNullAsDefault: true,
		pool: { min: 1, max: 1 },
	});
}

export async function applyPragmas(db: Knex): Promise<void> {
	await db.raw('PRAGMA journal_mode = WAL');
	await db.raw('PRAGMA foreign_keys = ON');
}
