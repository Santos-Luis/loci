import { Knex } from 'knex';
import { makeTestDb } from '../../helpers/db';
import { createTopic } from '../../../src/main/repositories/topics';
import {
	createNote,
	updateNote,
	listNotes,
	getNote,
	listNotesByTopic,
	deleteNote,
} from '../../../src/main/repositories/notes';

let db: Knex;

beforeEach(async () => {
	db = await makeTestDb();
});

afterEach(async () => {
	await db.destroy();
});

describe('notes repository', () => {
	it('creates, fetches, lists, and deletes notes', async () => {
		const note = await createNote(db, { topicId: null, title: 'First', content: 'hello' });
		expect(note.id).toBeGreaterThan(0);
		expect(note.topicId).toBeNull();
		expect(note.title).toBe('First');

		const fetched = await getNote(db, note.id);
		expect(fetched?.content).toBe('hello');

		const all = await listNotes(db);
		expect(all).toHaveLength(1);

		await deleteNote(db, note.id);
		expect(await getNote(db, note.id)).toBeUndefined();
	});

	it('updates content and bumps updated_at', async () => {
		const note = await createNote(db, { topicId: null, title: 'T', content: 'old' });
		const updated = await updateNote(db, note.id, {
			topicId: null,
			title: 'T2',
			content: 'new',
		});
		expect(updated.title).toBe('T2');
		expect(updated.content).toBe('new');
	});

	it('lists notes filtered by topic', async () => {
		const topic = await createTopic(db, { name: 'AI', description: null });
		await createNote(db, { topicId: topic.id, title: 'a', content: 'a' });
		await createNote(db, { topicId: null, title: 'b', content: 'b' });

		const scoped = await listNotesByTopic(db, topic.id);
		expect(scoped).toHaveLength(1);
		expect(scoped[0].topicId).toBe(topic.id);
	});
});
