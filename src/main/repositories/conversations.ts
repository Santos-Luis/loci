import { Context } from '../entities/context';
import { Conversation, ConversationRow } from '../entities/conversation';

export async function createConversation({
	ctx,
	topicId,
	title,
}: {
	ctx: Context;
	topicId: number | null;
	title: string;
}): Promise<Conversation> {
	const [id] = await ctx.db('conversations').insert({ topic_id: topicId, title });
	const row = await ctx.db<ConversationRow>('conversations').where({ id }).first();

	return mapConversation(row as ConversationRow);
}

export async function getConversation({
	ctx,
	id,
}: {
	ctx: Context;
	id: number;
}): Promise<Conversation | undefined> {
	const row = await ctx.db<ConversationRow>('conversations').where({ id }).first();

	return row ? mapConversation(row) : undefined;
}

export async function listConversations({
	ctx,
	limit,
}: {
	ctx: Context;
	limit: number;
}): Promise<Conversation[]> {
	const rows = await ctx.db<ConversationRow>('conversations').orderBy('id', 'desc').limit(limit);

	return rows.map(mapConversation);
}

export async function listConversationsByTopic({
	ctx,
	topicId,
}: {
	ctx: Context;
	topicId: number;
}): Promise<Conversation[]> {
	const rows = await ctx
		.db<ConversationRow>('conversations')
		.where({ topic_id: topicId })
		.orderBy('id', 'desc');

	return rows.map(mapConversation);
}

function mapConversation(row: ConversationRow): Conversation {
	return {
		id: row.id,
		topicId: row.topic_id,
		title: row.title,
		createdAt: row.created_at,
	};
}
