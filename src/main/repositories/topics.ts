import { Knex } from 'knex';
import { Topic } from '../entities/topic';

type TopicRow = {
	id: number;
	name: string;
	description: string | null;
	created_at: string;
};

function mapTopic(row: TopicRow): Topic {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		createdAt: row.created_at,
	};
}

export async function createTopic(
	db: Knex,
	{ name, description }: { name: string; description: string | null },
): Promise<Topic> {
	const [id] = await db('topics').insert({ name, description });
	const row = await db<TopicRow>('topics').where({ id }).first();

	return mapTopic(row as TopicRow);
}

export async function listTopics(db: Knex): Promise<Topic[]> {
	const rows = await db<TopicRow>('topics').orderBy('id', 'desc');

	return rows.map(mapTopic);
}

export async function getTopic(db: Knex, id: number): Promise<Topic | undefined> {
	const row = await db<TopicRow>('topics').where({ id }).first();

	return row ? mapTopic(row) : undefined;
}
