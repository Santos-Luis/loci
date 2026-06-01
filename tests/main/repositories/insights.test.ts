import { makeTestDb } from '../../helpers/db';
import { AppContext } from '../../../src/main/entities/app-context';
import {
	createInsight,
	listInsights,
	getLatestUnreadInsight,
	countUnreadInsights,
	markAllInsightsRead,
} from '../../../src/main/repositories/insights';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('insights repository', () => {
	it('creates insights unread and tracks the unread count', async () => {
		await createInsight({ ctx, topicId: null, type: 'summary', content: 's1' });
		await createInsight({ ctx, topicId: null, type: 'question', content: 'q1' });

		expect(await countUnreadInsights(ctx)).toBe(2);

		const latest = await getLatestUnreadInsight(ctx);
		expect(latest?.content).toBe('q1');
		expect(latest?.readAt).toBeNull();
	});

	it('filters by type and topic', async () => {
		await createInsight({ ctx, topicId: null, type: 'summary', content: 's' });
		await createInsight({ ctx, topicId: null, type: 'connection', content: 'c' });

		const summaries = await listInsights({ ctx, type: 'summary' });
		expect(summaries).toHaveLength(1);
		expect(summaries[0].type).toBe('summary');
	});

	it('marks all read', async () => {
		await createInsight({ ctx, topicId: null, type: 'summary', content: 's' });
		await markAllInsightsRead(ctx);
		expect(await countUnreadInsights(ctx)).toBe(0);
		expect(await getLatestUnreadInsight(ctx)).toBeUndefined();
	});
});
