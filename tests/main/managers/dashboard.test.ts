import { AppContext } from '../../../src/main/entities/app-context';
import { makeTestDb } from '../../helpers/db';
import { getDashboard } from '../../../src/main/managers/dashboard';
import { createNote } from '../../../src/main/repositories/notes';
import { createConversation } from '../../../src/main/repositories/conversations';
import { createInsight } from '../../../src/main/repositories/insights';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('getDashboard', () => {
	it('returns nulls and empty lists for a fresh database', async () => {
		const data = await getDashboard(ctx);
		expect(data.latestInsight).toBeNull();
		expect(data.lastNote).toBeNull();
		expect(data.recentConversations).toEqual([]);
	});

	it('returns the latest unread insight, recent conversations, and the last note', async () => {
		await createInsight({ ctx, topicId: null, type: 'summary', content: 'insight' });
		await createConversation({ ctx, topicId: null, title: 'chat one' });
		await createNote({ ctx, topicId: null, title: 'note', content: 'body' });

		const data = await getDashboard(ctx);
		expect(data.latestInsight?.content).toBe('insight');
		expect(data.recentConversations).toHaveLength(1);
		expect(data.lastNote?.title).toBe('note');
	});
});
