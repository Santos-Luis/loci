import { Knex } from 'knex';
import { Conversation } from '../entities/conversation';

type ConversationRow = {
	id: number;
	topic_id: number | null;
	title: string;
	created_at: string;
};

function mapConversation(row: ConversationRow): Conversation {
	return {
		id: row.id,
		topicId: row.topic_id,
		title: row.title,
		createdAt: row.created_at,
	};
}

export async function createConversation(
	db: Knex,
	{ topicId, title }: { topicId: number | null; title: string },
): Promise<Conversation> {
	const [id] = await db('conversations').insert({ topic_id: topicId, title });
	const row = await db<ConversationRow>('conversations').where({ id }).first();

	return mapConversation(row as ConversationRow);
}

export async function getConversation(db: Knex, id: number): Promise<Conversation | undefined> {
	const row = await db<ConversationRow>('conversations').where({ id }).first();

	return row ? mapConversation(row) : undefined;
}

export async function listConversations(
	db: Knex,
	{ limit }: { limit: number },
): Promise<Conversation[]> {
	const rows = await db<ConversationRow>('conversations').orderBy('id', 'desc').limit(limit);

	return rows.map(mapConversation);
}

export async function listConversationsByTopic(db: Knex, topicId: number): Promise<Conversation[]> {
	const rows = await db<ConversationRow>('conversations')
		.where({ topic_id: topicId })
		.orderBy('id', 'desc');

	return rows.map(mapConversation);
}
