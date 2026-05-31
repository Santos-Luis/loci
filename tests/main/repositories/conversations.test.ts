import { Knex } from 'knex';
import { makeTestDb } from '../../helpers/db';
import { createTopic } from '../../../src/main/repositories/topics';
import {
	createConversation,
	getConversation,
	listConversations,
	listConversationsByTopic,
} from '../../../src/main/repositories/conversations';

let db: Knex;

beforeEach(async () => {
	db = await makeTestDb();
});

afterEach(async () => {
	await db.destroy();
});

describe('conversations repository', () => {
	it('creates and fetches a conversation', async () => {
		const conv = await createConversation(db, { topicId: null, title: 'Hello there' });
		expect(conv.id).toBeGreaterThan(0);
		expect(conv.title).toBe('Hello there');
		expect((await getConversation(db, conv.id))?.title).toBe('Hello there');
	});

	it('lists conversations newest first with a limit', async () => {
		await createConversation(db, { topicId: null, title: 'one' });
		await createConversation(db, { topicId: null, title: 'two' });
		await createConversation(db, { topicId: null, title: 'three' });

		const recent = await listConversations(db, { limit: 2 });
		expect(recent.map((c) => c.title)).toEqual(['three', 'two']);
	});

	it('lists conversations by topic', async () => {
		const topic = await createTopic(db, { name: 'AI', description: null });
		await createConversation(db, { topicId: topic.id, title: 'tagged' });
		await createConversation(db, { topicId: null, title: 'free' });

		const scoped = await listConversationsByTopic(db, topic.id);
		expect(scoped).toHaveLength(1);
		expect(scoped[0].title).toBe('tagged');
	});
});
