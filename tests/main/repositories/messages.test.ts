import { makeTestDb } from '../../helpers/db';
import { AppContext } from '../../../src/main/context';
import { createConversation } from '../../../src/main/repositories/conversations';
import {
	createMessage,
	listMessages,
	listRecentMessages,
} from '../../../src/main/repositories/messages';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('messages repository', () => {
	it('creates messages and lists them oldest first', async () => {
		const conv = await createConversation(ctx, { topicId: null, title: 'c' });
		await createMessage(ctx, { conversationId: conv.id, role: 'user', content: 'q1' });
		await createMessage(ctx, { conversationId: conv.id, role: 'assistant', content: 'a1' });

		const all = await listMessages(ctx, conv.id);
		expect(all.map((m) => m.content)).toEqual(['q1', 'a1']);
		expect(all[0].role).toBe('user');
	});

	it('returns the last N messages in chronological order', async () => {
		const conv = await createConversation(ctx, { topicId: null, title: 'c' });
		for (let i = 1; i <= 7; i++) {
			await createMessage(ctx, { conversationId: conv.id, role: 'user', content: `m${i}` });
		}

		const recent = await listRecentMessages(ctx, { conversationId: conv.id, limit: 5 });
		expect(recent.map((m) => m.content)).toEqual(['m3', 'm4', 'm5', 'm6', 'm7']);
	});
});
