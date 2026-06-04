import { AppContext } from '../entities/app-context';

type NoteMaterialRow = {
	title: string;
	content: string;
};

type MessageMaterialRow = {
	content: string;
};

export async function gatherTopicMaterial({
	ctx,
	topicId,
	days,
}: {
	ctx: AppContext;
	topicId: number;
	days: number;
}): Promise<string> {
	const since = `-${days} days`;

	const notes = (await ctx.db.raw(
		`SELECT title, content FROM notes
     WHERE topic_id = ? AND updated_at >= datetime('now', ?)
     ORDER BY updated_at DESC`,
		[topicId, since],
	)) as NoteMaterialRow[];

	const messages = (await ctx.db.raw(
		`SELECT m.content AS content FROM messages m
     JOIN conversations c ON c.id = m.conversation_id
     WHERE c.topic_id = ? AND m.created_at >= datetime('now', ?)
     ORDER BY m.id ASC`,
		[topicId, since],
	)) as MessageMaterialRow[];

	const lines = [
		...notes.map((n) => `note: ${n.title}\n${n.content}`),
		...messages.map((m) => `message: ${m.content}`),
	];

	return lines.join('\n\n');
}
