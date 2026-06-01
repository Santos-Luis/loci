import { Context } from '../entities/context';
import { Message, MessageRole, MessageRow } from '../entities/message';

export async function createMessage({
	ctx,
	conversationId,
	role,
	content,
}: {
	ctx: Context;
	conversationId: number;
	role: MessageRole;
	content: string;
}): Promise<Message> {
	const [id] = await ctx
		.db('messages')
		.insert({ conversation_id: conversationId, role, content });
	const row = await ctx.db<MessageRow>('messages').where({ id }).first();

	return mapMessage(row as MessageRow);
}

export async function listMessages({
	ctx,
	conversationId,
}: {
	ctx: Context;
	conversationId: number;
}): Promise<Message[]> {
	const rows = await ctx
		.db<MessageRow>('messages')
		.where({ conversation_id: conversationId })
		.orderBy('id', 'asc');

	return rows.map(mapMessage);
}

export async function listRecentMessages({
	ctx,
	conversationId,
	limit,
}: {
	ctx: Context;
	conversationId: number;
	limit: number;
}): Promise<Message[]> {
	const rows = await ctx
		.db<MessageRow>('messages')
		.where({ conversation_id: conversationId })
		.orderBy('id', 'desc')
		.limit(limit);

	return rows.map(mapMessage).reverse();
}

function mapMessage(row: MessageRow): Message {
	return {
		id: row.id,
		conversationId: row.conversation_id,
		role: row.role,
		content: row.content,
		createdAt: row.created_at,
	};
}
