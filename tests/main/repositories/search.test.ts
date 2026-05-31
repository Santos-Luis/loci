import { Knex } from 'knex';
import { makeTestDb } from '../../helpers/db';
import { createTopic } from '../../../src/main/repositories/topics';
import { createNote } from '../../../src/main/repositories/notes';
import { createConversation } from '../../../src/main/repositories/conversations';
import { createMessage } from '../../../src/main/repositories/messages';
import { createInsight } from '../../../src/main/repositories/insights';
import { searchNotes, searchMessages, searchInsights } from '../../../src/main/repositories/search';

let db: Knex;

beforeEach(async () => {
	db = await makeTestDb();
});

afterEach(async () => {
	await db.destroy();
});

describe('search repository (FTS5)', () => {
	it('finds matching notes and returns SearchHit shape', async () => {
		const topic = await createTopic(db, { name: 'Science', description: null });
		await createNote(db, {
			topicId: topic.id,
			title: 'Photosynthesis',
			content: 'plants and light',
		});
		await createNote(db, { topicId: null, title: 'Cooking', content: 'pasta recipes' });

		const hits = await searchNotes(db, { query: '"plants"', limit: 10 });
		expect(hits).toHaveLength(1);
		expect(hits[0].source).toBe('note');
		expect(hits[0].title).toBe('Photosynthesis');
		expect(typeof hits[0].score).toBe('number');
	});

	it('finds matching messages with the conversation topic id', async () => {
		const topic = await createTopic(db, { name: 'Geology', description: null });
		const conv = await createConversation(db, { topicId: topic.id, title: 'c' });
		await createMessage(db, {
			conversationId: conv.id,
			role: 'user',
			content: 'tell me about volcanoes',
		});

		const hits = await searchMessages(db, { query: '"volcanoes"', limit: 10 });
		expect(hits).toHaveLength(1);
		expect(hits[0].source).toBe('message');
		expect(hits[0].topicId).toBe(topic.id);
	});

	it('finds matching insights', async () => {
		await createInsight(db, {
			topicId: null,
			type: 'summary',
			content: 'quantum entanglement basics',
		});

		const hits = await searchInsights(db, { query: '"quantum"', limit: 10 });
		expect(hits).toHaveLength(1);
		expect(hits[0].source).toBe('insight');
	});

	it('returns empty for an empty query', async () => {
		expect(await searchNotes(db, { query: '', limit: 10 })).toEqual([]);
	});
});
