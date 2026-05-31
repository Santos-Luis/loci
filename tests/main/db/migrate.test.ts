import { applyPragmas, createDb } from '../../../src/main/db/knex';
import { runMigrations } from '../../../src/main/db/migrate';

async function tableNames(db: Awaited<ReturnType<typeof createDb>>): Promise<string[]> {
	const rows = await db.raw("SELECT name FROM sqlite_master WHERE type IN ('table')");

	return rows.map((r: { name: string }) => r.name);
}

describe('runMigrations', () => {
	it('creates all domain tables, FTS tables, and seeds settings', async () => {
		const db = createDb(':memory:');
		await applyPragmas(db);
		await runMigrations(db);

		const names = await tableNames(db);
		for (const t of ['topics', 'notes', 'conversations', 'messages', 'insights', 'settings']) {
			expect(names).toContain(t);
		}
		for (const fts of ['notes_fts', 'messages_fts', 'insights_fts']) {
			expect(names).toContain(fts);
		}

		const model = await db('settings').where({ key: 'model' }).first();
		expect(model.value).toBe('claude-sonnet-4-6');

		await db.destroy();
	});

	it('is idempotent', async () => {
		const db = createDb(':memory:');
		await applyPragmas(db);
		await runMigrations(db);
		await runMigrations(db);

		const count = await db('settings').count({ n: '*' }).first();
		expect(Number(count!.n)).toBeGreaterThan(0);

		await db.destroy();
	});
});
