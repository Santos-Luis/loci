import { createDb, applyPragmas } from '../../../src/main/db/knex'

describe('createDb', () => {
	it('creates a usable in-memory database and applies pragmas', async () => {
		const db = createDb(':memory:')
		await applyPragmas(db)

		const fk = await db.raw('PRAGMA foreign_keys')
		expect(fk[0].foreign_keys).toBe(1)

		const result = await db.raw('SELECT 1 AS value')
		expect(result[0].value).toBe(1)

		await db.destroy()
	})
})
