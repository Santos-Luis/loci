import { Context } from '../entities/context';
import { Insight, InsightType, InsightRow } from '../entities/insight';

export async function createInsight({
	ctx,
	topicId,
	type,
	content,
}: {
	ctx: Context;
	topicId: number | null;
	type: InsightType;
	content: string;
}): Promise<Insight> {
	const [id] = await ctx.db('insights').insert({ topic_id: topicId, type, content });
	const row = await ctx.db<InsightRow>('insights').where({ id }).first();

	return mapInsight(row as InsightRow);
}

export async function listInsights({
	ctx,
	type,
	topicId,
}: {
	ctx: Context;
	type?: InsightType;
	topicId?: number;
}): Promise<Insight[]> {
	const query = ctx.db<InsightRow>('insights').orderBy('id', 'desc');

	if (type) {
		query.where({ type });
	}

	if (topicId !== undefined) {
		query.where({ topic_id: topicId });
	}

	const rows = await query;

	return rows.map(mapInsight);
}

export async function getLatestUnreadInsight(ctx: Context): Promise<Insight | undefined> {
	const row = await ctx
		.db<InsightRow>('insights')
		.whereNull('read_at')
		.orderBy('id', 'desc')
		.first();

	return row ? mapInsight(row) : undefined;
}

export async function countUnreadInsights(ctx: Context): Promise<number> {
	const result = await ctx.db('insights').whereNull('read_at').count({ n: '*' }).first();

	return Number(result?.n ?? 0);
}

export async function markAllInsightsRead(ctx: Context): Promise<void> {
	await ctx.db('insights').whereNull('read_at').update({ read_at: ctx.db.fn.now() });
}

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
