import { AppContext } from '../../../src/main/entities/app-context';
import { makeTestDb } from '../../helpers/db';
import {
	createNoteChecked,
	updateNoteChecked,
	searchNotesByText,
} from '../../../src/main/managers/notes';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('notes manager', () => {
	it('creates a note, trimming the title', async () => {
		const note = await createNoteChecked({
			ctx,
			topicId: null,
			title: '  Hi  ',
			content: 'body',
		});
		expect(note.title).toBe('Hi');
		expect(note.content).toBe('body');
	});

	it('rejects a note that is entirely empty', async () => {
		await expect(
			createNoteChecked({ ctx, topicId: null, title: '   ', content: '   ' }),
		).rejects.toThrow();
	});

	it('updates an existing note', async () => {
		const note = await createNoteChecked({ ctx, topicId: null, title: 'a', content: 'a' });
		const updated = await updateNoteChecked({
			ctx,
			id: note.id,
			topicId: null,
			title: 'b',
			content: 'b',
		});
		expect(updated.title).toBe('b');
	});

	it('searches notes by free text, sanitising the query', async () => {
		await createNoteChecked({
			ctx,
			topicId: null,
			title: 'Photosynthesis',
			content: 'plants and light',
		});
		await createNoteChecked({ ctx, topicId: null, title: 'Cooking', content: 'pasta' });

		const hits = await searchNotesByText({ ctx, query: 'what about plants?' });
		expect(hits).toHaveLength(1);
		expect(hits[0].source).toBe('note');
		expect(hits[0].title).toBe('Photosynthesis');
	});

	it('returns no hits for a query with no usable tokens', async () => {
		await createNoteChecked({ ctx, topicId: null, title: 'x', content: 'y' });
		expect(await searchNotesByText({ ctx, query: '   ?!  ' })).toEqual([]);
	});
});
