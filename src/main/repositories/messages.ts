import { Knex } from 'knex';
import { Message, MessageRole } from '../entities/message';

type MessageRow = {
	id: number;
	conversation_id: number;
	role: MessageRole;
	content: string;
	created_at: string;
};

function mapMessage(row: MessageRow): Message {
	return {
		id: row.id,
		conversationId: row.conversation_id,
		role: row.role,
		content: row.content,
		createdAt: row.created_at,
	};
}

export async function createMessage(
	db: Knex,
	{
		conversationId,
		role,
		content,
	}: { conversationId: number; role: MessageRole; content: string },
): Promise<Message> {
	const [id] = await db('messages').insert({
		conversation_id: conversationId,
		role,
		content,
	});
	const row = await db<MessageRow>('messages').where({ id }).first();

	return mapMessage(row as MessageRow);
}

export async function listMessages(db: Knex, conversationId: number): Promise<Message[]> {
	const rows = await db<MessageRow>('messages')
		.where({ conversation_id: conversationId })
		.orderBy('id', 'asc');

	return rows.map(mapMessage);
}

export async function listRecentMessages(
	db: Knex,
	{ conversationId, limit }: { conversationId: number; limit: number },
): Promise<Message[]> {
	const rows = await db<MessageRow>('messages')
		.where({ conversation_id: conversationId })
		.orderBy('id', 'desc')
		.limit(limit);

	return rows.map(mapMessage).reverse();
}
