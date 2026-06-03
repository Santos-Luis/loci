import { AppContext } from '../entities/app-context';
import { Note } from '../entities/note';
import { SearchHit } from '../entities/search';
import { createNote, updateNote } from '../repositories/notes';
import { searchNotes } from '../repositories/search';
import { sanitizeFtsQuery } from './retrieval';

export async function createNoteChecked({
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
	const trimmedTitle = title.trim();
	const trimmedContent = content.trim();

	if (!trimmedTitle && !trimmedContent) {
		throw new Error('Note must have a title or content');
	}

	return createNote({ ctx, topicId, title: trimmedTitle, content: trimmedContent });
}

export async function updateNoteChecked({
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
	const trimmedTitle = title.trim();
	const trimmedContent = content.trim();

	if (!trimmedTitle && !trimmedContent) {
		throw new Error('Note must have a title or content');
	}

	return updateNote({ ctx, id, topicId, title: trimmedTitle, content: trimmedContent });
}

export async function searchNotesByText({
	ctx,
	query,
}: {
	ctx: AppContext;
	query: string;
}): Promise<SearchHit[]> {
	const ftsQuery = sanitizeFtsQuery(query);

	if (!ftsQuery) {
		return [];
	}

	return searchNotes({ ctx, query: ftsQuery, limit: 20 });
}
