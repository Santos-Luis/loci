import { makeTestDb } from '../../helpers/db';
import { AppContext } from '../../../src/main/entities/app-context';
import { createTopic } from '../../../src/main/repositories/topics';
import {
	createConversation,
	getConversation,
	listConversations,
	listConversationsByTopic,
	updateConversation,
} from '../../../src/main/repositories/conversations';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('conversations repository', () => {
	it('creates and fetches a conversation', async () => {
		const conv = await createConversation({ ctx, topicId: null, title: 'Hello there' });
		expect(conv.id).toBeGreaterThan(0);
		expect(conv.title).toBe('Hello there');
		expect((await getConversation({ ctx, id: conv.id }))?.title).toBe('Hello there');
	});

	it('lists conversations newest first with a limit', async () => {
		await createConversation({ ctx, topicId: null, title: 'one' });
		await createConversation({ ctx, topicId: null, title: 'two' });
		await createConversation({ ctx, topicId: null, title: 'three' });

		const recent = await listConversations({ ctx, limit: 2 });
		expect(recent.map((c) => c.title)).toEqual(['three', 'two']);
	});

	it('updates the topic of a conversation', async () => {
		const topic = await createTopic({ ctx, name: 'AI', description: null });
		const conv = await createConversation({ ctx, topicId: null, title: 'test' });
		expect(conv.topicId).toBeNull();

		const updated = await updateConversation({ ctx, id: conv.id, topicId: topic.id });
		expect(updated.topicId).toBe(topic.id);

		const cleared = await updateConversation({ ctx, id: conv.id, topicId: null });
		expect(cleared.topicId).toBeNull();
	});

	it('lists conversations by topic', async () => {
		const topic = await createTopic({ ctx, name: 'AI', description: null });
		await createConversation({ ctx, topicId: topic.id, title: 'tagged' });
		await createConversation({ ctx, topicId: null, title: 'free' });

		const scoped = await listConversationsByTopic({ ctx, topicId: topic.id });
		expect(scoped).toHaveLength(1);
		expect(scoped[0].title).toBe('tagged');
	});
});
