import { Knex } from 'knex';
import { Note } from '../entities/note';

type NoteRow = {
	id: number;
	topic_id: number | null;
	title: string;
	content: string;
	created_at: string;
	updated_at: string;
};

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

async function findNote(db: Knex, id: number): Promise<NoteRow | undefined> {
	return db<NoteRow>('notes').where({ id }).first();
}

export async function createNote(
	db: Knex,
	{ topicId, title, content }: { topicId: number | null; title: string; content: string },
): Promise<Note> {
	const [id] = await db('notes').insert({ topic_id: topicId, title, content });

	return mapNote((await findNote(db, id)) as NoteRow);
}

export async function updateNote(
	db: Knex,
	id: number,
	{ topicId, title, content }: { topicId: number | null; title: string; content: string },
): Promise<Note> {
	await db('notes')
		.where({ id })
		.update({ topic_id: topicId, title, content, updated_at: db.fn.now() });

	return mapNote((await findNote(db, id)) as NoteRow);
}

export async function getNote(db: Knex, id: number): Promise<Note | undefined> {
	const row = await findNote(db, id);

	return row ? mapNote(row) : undefined;
}

export async function listNotes(db: Knex): Promise<Note[]> {
	const rows = await db<NoteRow>('notes').orderBy('updated_at', 'desc');

	return rows.map(mapNote);
}

export async function listNotesByTopic(db: Knex, topicId: number): Promise<Note[]> {
	const rows = await db<NoteRow>('notes')
		.where({ topic_id: topicId })
		.orderBy('updated_at', 'desc');

	return rows.map(mapNote);
}

export async function deleteNote(db: Knex, id: number): Promise<void> {
	await db('notes').where({ id }).del();
}
