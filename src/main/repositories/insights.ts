import { Knex } from 'knex';
import { Insight, InsightType } from '../entities/insight';

type InsightRow = {
	id: number;
	topic_id: number | null;
	type: InsightType;
	content: string;
	generated_at: string;
	read_at: string | null;
};

function mapInsight(row: InsightRow): Insight {
	return {
		id: row.id,
		topicId: row.topic_id,
		type: row.type,
		content: row.content,
		generatedAt: row.generated_at,
		readAt: row.read_at,
	};
}

export async function createInsight(
	db: Knex,
	{ topicId, type, content }: { topicId: number | null; type: InsightType; content: string },
): Promise<Insight> {
	const [id] = await db('insights').insert({ topic_id: topicId, type, content });
	const row = await db<InsightRow>('insights').where({ id }).first();

	return mapInsight(row as InsightRow);
}

export async function listInsights(
	db: Knex,
	{ type, topicId }: { type?: InsightType; topicId?: number } = {},
): Promise<Insight[]> {
	const query = db<InsightRow>('insights').orderBy('id', 'desc');
	if (type) {
		query.where({ type });
	}

	if (topicId !== undefined) {
		query.where({ topic_id: topicId });
	}

	const rows = await query;

	return rows.map(mapInsight);
}

export async function getLatestUnreadInsight(db: Knex): Promise<Insight | undefined> {
	const row = await db<InsightRow>('insights').whereNull('read_at').orderBy('id', 'desc').first();

	return row ? mapInsight(row) : undefined;
}

export async function countUnreadInsights(db: Knex): Promise<number> {
	const result = await db('insights').whereNull('read_at').count({ n: '*' }).first();

	return Number(result?.n ?? 0);
}

export async function markAllInsightsRead(db: Knex): Promise<void> {
	await db('insights').whereNull('read_at').update({ read_at: db.fn.now() });
}
