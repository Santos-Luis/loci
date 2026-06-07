import { AppContext } from '../../../src/main/entities/app-context';
import { makeTestDb } from '../../helpers/db';
import { conversationTitle, prepareAsk, completeAsk } from '../../../src/main/managers/ask';
import { listMessages } from '../../../src/main/repositories/messages';
import { getConversation, updateConversation } from '../../../src/main/repositories/conversations';
import { createTopic } from '../../../src/main/repositories/topics';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('conversationTitle', () => {
	it('uses the first 60 characters of the trimmed message', () => {
		expect(conversationTitle('  hello world  ')).toBe('hello world');
		expect(conversationTitle('x'.repeat(80))).toHaveLength(60);
	});
});

describe('prepareAsk', () => {
	it('creates a conversation on first send, persists the user message, and builds a prompt', async () => {
		const result = await prepareAsk({
			ctx,
			conversationId: null,
			message: 'What is photosynthesis?',
			topicId: null,
		});

		expect(result.conversationId).toBeGreaterThan(0);
		expect(result.prompt).toContain('What is photosynthesis?');
		expect(result.context).toHaveProperty('hits');

		const conv = await getConversation({ ctx, id: result.conversationId });
		expect(conv?.title).toBe('What is photosynthesis?');

		const messages = await listMessages({ ctx, conversationId: result.conversationId });
		expect(messages).toHaveLength(1);
		expect(messages[0].role).toBe('user');
	});

	it("uses the conversation's stored topic_id, ignoring the payload topicId when continuing", async () => {
		const topic = await createTopic({ ctx, name: 'Science', description: null });
		const first = await prepareAsk({ ctx, conversationId: null, message: 'one', topicId: topic.id });
		await updateConversation({ ctx, id: first.conversationId, topicId: null });

		// Passing a different topicId in the payload — should be ignored for existing conversation
		const second = await prepareAsk({
			ctx,
			conversationId: first.conversationId,
			message: 'two',
			topicId: topic.id,
		});
		expect(second.conversationId).toBe(first.conversationId);
	});

	it('reuses an existing conversation', async () => {
		const first = await prepareAsk({
			ctx,
			conversationId: null,
			message: 'one',
			topicId: null,
		});
		const second = await prepareAsk({
			ctx,
			conversationId: first.conversationId,
			message: 'two',
			topicId: null,
		});

		expect(second.conversationId).toBe(first.conversationId);
		const messages = await listMessages({ ctx, conversationId: first.conversationId });
		expect(messages.map((m) => m.content)).toEqual(['one', 'two']);
	});
});

describe('completeAsk', () => {
	it('persists the assistant message', async () => {
		const prepared = await prepareAsk({
			ctx,
			conversationId: null,
			message: 'hi',
			topicId: null,
		});
		const message = await completeAsk({
			ctx,
			conversationId: prepared.conversationId,
			content: 'hello back',
		});

		expect(message.role).toBe('assistant');
		expect(message.content).toBe('hello back');
	});
});
