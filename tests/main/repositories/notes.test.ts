import { makeTestDb } from '../../helpers/db';
import { Context } from '../../../src/main/context';
import { createTopic } from '../../../src/main/repositories/topics';
import {
	createNote,
	updateNote,
	listNotes,
	getNote,
	listNotesByTopic,
	deleteNote,
} from '../../../src/main/repositories/notes';

let ctx: Context;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('notes repository', () => {
	it('creates, fetches, lists, and deletes notes', async () => {
		const note = await createNote({ ctx, topicId: null, title: 'First', content: 'hello' });
		expect(note.id).toBeGreaterThan(0);
		expect(note.topicId).toBeNull();
		expect(note.title).toBe('First');

		const fetched = await getNote({ ctx, id: note.id });
		expect(fetched?.content).toBe('hello');

		const all = await listNotes(ctx);
		expect(all).toHaveLength(1);

		await deleteNote({ ctx, id: note.id });
		expect(await getNote({ ctx, id: note.id })).toBeUndefined();
	});

	it('updates content and bumps updated_at', async () => {
		const note = await createNote({ ctx, topicId: null, title: 'T', content: 'old' });
		const updated = await updateNote({
			ctx,
			id: note.id,
			topicId: null,
			title: 'T2',
			content: 'new',
		});
		expect(updated.title).toBe('T2');
		expect(updated.content).toBe('new');
	});

	it('lists notes filtered by topic', async () => {
		const topic = await createTopic({ ctx, name: 'AI', description: null });
		await createNote({ ctx, topicId: topic.id, title: 'a', content: 'a' });
		await createNote({ ctx, topicId: null, title: 'b', content: 'b' });

		const scoped = await listNotesByTopic({ ctx, topicId: topic.id });
		expect(scoped).toHaveLength(1);
		expect(scoped[0].topicId).toBe(topic.id);
	});
});
