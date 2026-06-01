import { makeTestDb } from '../../helpers/db';
import { AppContext } from '../../../src/main/entities/app-context';
import { createTopic, listTopics, getTopic } from '../../../src/main/repositories/topics';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('topics repository', () => {
	it('creates a topic and reads it back with camelCase fields', async () => {
		const topic = await createTopic({ ctx, name: 'AI', description: 'machine learning' });
		expect(topic.id).toBeGreaterThan(0);
		expect(topic.name).toBe('AI');
		expect(topic.description).toBe('machine learning');
		expect(typeof topic.createdAt).toBe('string');
	});

	it('stores a null description when omitted', async () => {
		const topic = await createTopic({ ctx, name: 'Solo', description: null });
		expect(topic.description).toBeNull();
	});

	it('lists topics newest first and gets one by id', async () => {
		const a = await createTopic({ ctx, name: 'A', description: null });
		const b = await createTopic({ ctx, name: 'B', description: null });

		const all = await listTopics(ctx);
		expect(all.map((t) => t.id)).toEqual([b.id, a.id]);

		const fetched = await getTopic({ ctx, id: a.id });
		expect(fetched?.name).toBe('A');
		expect(await getTopic({ ctx, id: 9999 })).toBeUndefined();
	});
});
