import { AppContext } from '../context';
import { Topic, TopicRow } from '../entities/topic';

export async function createTopic(
	ctx: AppContext,
	{ name, description }: { name: string; description: string | null },
): Promise<Topic> {
	const [id] = await ctx.db('topics').insert({ name, description });
	const row = await ctx.db<TopicRow>('topics').where({ id }).first();

	return mapTopic(row as TopicRow);
}

export async function listTopics(ctx: AppContext): Promise<Topic[]> {
	const rows = await ctx.db<TopicRow>('topics').orderBy('id', 'desc');

	return rows.map(mapTopic);
}

export async function getTopic(ctx: AppContext, id: number): Promise<Topic | undefined> {
	const row = await ctx.db<TopicRow>('topics').where({ id }).first();

	return row ? mapTopic(row) : undefined;
}

function mapTopic(row: TopicRow): Topic {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		createdAt: row.created_at,
	};
}
