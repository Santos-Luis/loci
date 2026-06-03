import { AppContext } from '../../../src/main/entities/app-context';
import { makeTestDb } from '../../helpers/db';
import { createTopicChecked, getTopicDetail } from '../../../src/main/managers/topics';
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

describe('topics manager', () => {
	it('trims the name and normalises an empty description to null', async () => {
		const topic = await createTopicChecked({ ctx, name: '  AI  ', description: '   ' });
		expect(topic.name).toBe('AI');
		expect(topic.description).toBeNull();
	});

	it('rejects a blank name', async () => {
		await expect(createTopicChecked({ ctx, name: '   ', description: null })).rejects.toThrow();
	});

	it('assembles topic detail from notes, conversations, and insights', async () => {
		const topic = await createTopicChecked({ ctx, name: 'Space', description: null });
		await createNote({ ctx, topicId: topic.id, title: 'n', content: 'c' });
		await createConversation({ ctx, topicId: topic.id, title: 'chat' });
		await createInsight({ ctx, topicId: topic.id, type: 'summary', content: 's' });

		const detail = await getTopicDetail({ ctx, id: topic.id });
		expect(detail?.topic.name).toBe('Space');
		expect(detail?.notes).toHaveLength(1);
		expect(detail?.conversations).toHaveLength(1);
		expect(detail?.insights).toHaveLength(1);
	});

	it('returns null for a missing topic', async () => {
		expect(await getTopicDetail({ ctx, id: 9999 })).toBeNull();
	});
});
