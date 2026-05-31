import { Knex } from 'knex';
import { makeTestDb } from '../../helpers/db';
import { createTopic, listTopics, getTopic } from '../../../src/main/repositories/topics';

let db: Knex;

beforeEach(async () => {
	db = await makeTestDb();
});

afterEach(async () => {
	await db.destroy();
});

describe('topics repository', () => {
	it('creates a topic and reads it back with camelCase fields', async () => {
		const topic = await createTopic(db, { name: 'AI', description: 'machine learning' });
		expect(topic.id).toBeGreaterThan(0);
		expect(topic.name).toBe('AI');
		expect(topic.description).toBe('machine learning');
		expect(typeof topic.createdAt).toBe('string');
	});

	it('stores a null description when omitted', async () => {
		const topic = await createTopic(db, { name: 'Solo', description: null });
		expect(topic.description).toBeNull();
	});

	it('lists topics newest first and gets one by id', async () => {
		const a = await createTopic(db, { name: 'A', description: null });
		const b = await createTopic(db, { name: 'B', description: null });

		const all = await listTopics(db);
		expect(all.map((t) => t.id)).toEqual([b.id, a.id]);

		const fetched = await getTopic(db, a.id);
		expect(fetched?.name).toBe('A');
		expect(await getTopic(db, 9999)).toBeUndefined();
	});
});
