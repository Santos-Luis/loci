import { AppContext } from '../entities/context';
import { Note, NoteRow } from '../entities/note';

export async function createNote({
	ctx,
	topicId,
	title,
	content,
}: {
	ctx: AppContext;
	topicId: number | null;
	title: string;
	content: string;
}): Promise<Note> {
	const [id] = await ctx.db('notes').insert({ topic_id: topicId, title, content });
	const row = await findNoteRow({ ctx, id });

	return mapNote(row as NoteRow);
}

export async function updateNote({
	ctx,
	id,
	topicId,
	title,
	content,
}: {
	ctx: AppContext;
	id: number;
	topicId: number | null;
	title: string;
	content: string;
}): Promise<Note> {
	await ctx
		.db('notes')
		.where({ id })
		.update({ topic_id: topicId, title, content, updated_at: ctx.db.fn.now() });
	const row = await findNoteRow({ ctx, id });

	return mapNote(row as NoteRow);
}

export async function getNote({
	ctx,
	id,
}: {
	ctx: AppContext;
	id: number;
}): Promise<Note | undefined> {
	const row = await findNoteRow({ ctx, id });

	return row ? mapNote(row) : undefined;
}

export async function listNotes(ctx: AppContext): Promise<Note[]> {
	const rows = await ctx.db<NoteRow>('notes').orderBy('updated_at', 'desc');

	return rows.map(mapNote);
}

export async function listNotesByTopic({
	ctx,
	topicId,
}: {
	ctx: AppContext;
	topicId: number;
}): Promise<Note[]> {
	const rows = await ctx
		.db<NoteRow>('notes')
		.where({ topic_id: topicId })
		.orderBy('updated_at', 'desc');

	return rows.map(mapNote);
}

export async function deleteNote({ ctx, id }: { ctx: AppContext; id: number }): Promise<void> {
	await ctx.db('notes').where({ id }).del();
}

async function findNoteRow({
	ctx,
	id,
}: {
	ctx: AppContext;
	id: number;
}): Promise<NoteRow | undefined> {
	return ctx.db<NoteRow>('notes').where({ id }).first();
}

function mapNote(row: NoteRow): Note {
	return {
		id: row.id,
		topicId: row.topic_id,
		title: row.title,
		content: row.content,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}
