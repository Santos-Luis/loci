import { Context } from '../entities/context';
import { SearchHit } from '../entities/search';
import { Message } from '../entities/message';
import { RetrievedContext } from '../entities/context';
import { searchNotes, searchMessages, searchInsights } from '../repositories/search';
import { listRecentMessages } from '../repositories/messages';

export function sanitizeFtsQuery(input: string): string {
	const tokens = input.match(/[A-Za-z0-9]+/g);
	if (!tokens || tokens.length === 0) {
		return '';
	}

	return tokens.map((token) => `"${token}"`).join(' OR ');
}

const TOPIC_BOOST = 1.5;

export function mergeHits({
	groups,
	topicId,
	limit,
}: {
	groups: SearchHit[][];
	topicId: number | null;
	limit: number;
}): SearchHit[] {
	const all = groups.flat();

	const relevance = (hit: SearchHit): number => {
		const base = -hit.score;
		const boosted = topicId !== null && hit.topicId === topicId ? base * TOPIC_BOOST : base;

		return boosted;
	};

	return [...all].sort((a, b) => relevance(b) - relevance(a)).slice(0, limit);
}

export async function retrieveContext({
	ctx,
	query,
	conversationId,
	topicId,
	limit = 10,
	recentLimit = 5,
	perSourceLimit = 10,
}: {
	ctx: Context;
	query: string;
	conversationId: number | null;
	topicId: number | null;
	limit?: number;
	recentLimit?: number;
	perSourceLimit?: number;
}): Promise<RetrievedContext> {
	const ftsQuery = sanitizeFtsQuery(query);

	const groups = ftsQuery
		? await Promise.all([
			searchNotes({ ctx, query: ftsQuery, limit: perSourceLimit }),
			searchMessages({ ctx, query: ftsQuery, limit: perSourceLimit }),
			searchInsights({ ctx, query: ftsQuery, limit: perSourceLimit }),
		])
		: [];

	const hits = mergeHits({ groups, topicId, limit });

	const recentMessages: Message[] =
		conversationId === null
			? []
			: await listRecentMessages({ ctx, conversationId, limit: recentLimit });

	return { hits, recentMessages };
}
