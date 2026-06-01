import { makeTestDb } from '../../helpers/db';
import { Context } from '../../../src/main/entities/context';
import { createTopic } from '../../../src/main/repositories/topics';
import { createNote } from '../../../src/main/repositories/notes';
import { createConversation } from '../../../src/main/repositories/conversations';
import { createMessage } from '../../../src/main/repositories/messages';
import { createInsight } from '../../../src/main/repositories/insights';
import { searchNotes, searchMessages, searchInsights } from '../../../src/main/repositories/search';

let ctx: Context;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('search repository (FTS5)', () => {
	it('finds matching notes and returns SearchHit shape', async () => {
		const topic = await createTopic({ ctx, name: 'Science', description: null });
		await createNote({
			ctx,
			topicId: topic.id,
			title: 'Photosynthesis',
			content: 'plants and light',
		});
		await createNote({ ctx, topicId: null, title: 'Cooking', content: 'pasta recipes' });

		const hits = await searchNotes({ ctx, query: '"plants"', limit: 10 });
		expect(hits).toHaveLength(1);
		expect(hits[0].source).toBe('note');
		expect(hits[0].title).toBe('Photosynthesis');
		expect(typeof hits[0].score).toBe('number');
	});

	it('finds matching messages with the conversation topic id', async () => {
		const topic = await createTopic({ ctx, name: 'Geology', description: null });
		const conv = await createConversation({ ctx, topicId: topic.id, title: 'c' });
		await createMessage({
			ctx,
			conversationId: conv.id,
			role: 'user',
			content: 'tell me about volcanoes',
		});

		const hits = await searchMessages({ ctx, query: '"volcanoes"', limit: 10 });
		expect(hits).toHaveLength(1);
		expect(hits[0].source).toBe('message');
		expect(hits[0].topicId).toBe(topic.id);
	});

	it('finds matching insights', async () => {
		await createInsight({
			ctx,
			topicId: null,
			type: 'summary',
			content: 'quantum entanglement basics',
		});

		const hits = await searchInsights({ ctx, query: '"quantum"', limit: 10 });
		expect(hits).toHaveLength(1);
		expect(hits[0].source).toBe('insight');
	});

	it('returns empty for an empty query', async () => {
		expect(await searchNotes({ ctx, query: '', limit: 10 })).toEqual([]);
	});
});
