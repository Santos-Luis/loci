import { Context } from '../entities/context';
import { SearchHit } from '../entities/search';

type RawHit = {
	id: number;
	topic_id: number | null;
	title: string | null;
	content: string;
	score: number;
};

export async function searchNotes({
	ctx,
	query,
	limit,
}: {
	ctx: Context;
	query: string;
	limit: number;
}): Promise<SearchHit[]> {
	if (!query) {
		return [];
	}

	const rows = (await ctx.db.raw(
		`SELECT n.id AS id, n.topic_id AS topic_id, n.title AS title, n.content AS content,
			bm25(notes_fts) AS score
		 FROM notes_fts
		 JOIN notes n ON n.id = notes_fts.rowid
		 WHERE notes_fts MATCH ?
		 ORDER BY score ASC
		 LIMIT ?`,
		[query, limit],
	)) as RawHit[];

	return rows.map((r) => ({
		source: 'note' as const,
		id: r.id,
		topicId: r.topic_id,
		title: r.title,
		content: r.content,
		score: r.score,
	}));
}

export async function searchMessages({
	ctx,
	query,
	limit,
}: {
	ctx: Context;
	query: string;
	limit: number;
}): Promise<SearchHit[]> {
	if (!query) {
		return [];
	}

	const rows = (await ctx.db.raw(
		`SELECT m.id AS id, c.topic_id AS topic_id, m.content AS content,
			bm25(messages_fts) AS score
		 FROM messages_fts
		 JOIN messages m ON m.id = messages_fts.rowid
		 JOIN conversations c ON c.id = m.conversation_id
		 WHERE messages_fts MATCH ?
		 ORDER BY score ASC
		 LIMIT ?`,
		[query, limit],
	)) as RawHit[];

	return rows.map((r) => ({
		source: 'message' as const,
		id: r.id,
		topicId: r.topic_id,
		title: null,
		content: r.content,
		score: r.score,
	}));
}

export async function searchInsights({
	ctx,
	query,
	limit,
}: {
	ctx: Context;
	query: string;
	limit: number;
}): Promise<SearchHit[]> {
	if (!query) {
		return [];
	}

	const rows = (await ctx.db.raw(
		`SELECT i.id AS id, i.topic_id AS topic_id, i.content AS content,
			bm25(insights_fts) AS score
		 FROM insights_fts
		 JOIN insights i ON i.id = insights_fts.rowid
		 WHERE insights_fts MATCH ?
		 ORDER BY score ASC
		 LIMIT ?`,
		[query, limit],
	)) as RawHit[];

	return rows.map((r) => ({
		source: 'insight' as const,
		id: r.id,
		topicId: r.topic_id,
		title: null,
		content: r.content,
		score: r.score,
	}));
}
