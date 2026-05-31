import { Knex } from 'knex';
import { createDb, applyPragmas } from '../../src/main/db/knex';
import { runMigrations } from '../../src/main/db/migrate';

export async function makeTestDb(): Promise<Knex> {
	const db = createDb(':memory:');
	await applyPragmas(db);
	await runMigrations(db);

	return db;
}
