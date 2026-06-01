import { AppContext } from '../../../src/main/entities/app-context';
import { makeTestDb } from '../../helpers/db';
import { createNote } from '../../../src/main/repositories/notes';
import { createConversation } from '../../../src/main/repositories/conversations';
import { createMessage } from '../../../src/main/repositories/messages';
import { retrieveContext } from '../../../src/main/managers/retrieval';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('retrieveContext', () => {
	it('returns relevant hits and recent conversation messages', async () => {
		await createNote({ ctx, topicId: null, title: 'Mars', content: 'the red planet rovers' });
		const conv = await createConversation({ ctx, topicId: null, title: 'space chat' });
		await createMessage({
			ctx,
			conversationId: conv.id,
			role: 'user',
			content: 'earlier message',
		});

		const context = await retrieveContext({
			ctx,
			query: 'rovers on the red planet',
			conversationId: conv.id,
			topicId: null,
		});

		expect(context.hits.some((h) => h.content.includes('red planet'))).toBe(true);
		expect(context.recentMessages.map((m) => m.content)).toContain('earlier message');
	});

	it('returns no hits for a query with no usable tokens', async () => {
		const context = await retrieveContext({
			ctx,
			query: '???',
			conversationId: null,
			topicId: null,
		});
		expect(context.hits).toEqual([]);
		expect(context.recentMessages).toEqual([]);
	});
});
