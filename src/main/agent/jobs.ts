import { AppContext } from '../entities/app-context';
import { Insight } from '../entities/insight';
import { listTopics } from '../repositories/topics';
import { gatherTopicMaterial } from '../repositories/activity';
import { createInsight, listInsights } from '../repositories/insights';
import { buildSummaryPrompt, buildSynthesisPrompt } from '../managers/prompt';

export function parseSynthesis(text: string): { connection: string; questions: string[] } {
	const match = text.split(/questions:/i);
	const connection = match[0].trim();

	if (match.length < 2) {
		return { connection, questions: [] };
	}

	const questions = match[1]
		.split('\n')
		.map((line) => line.replace(/^[\s\-*\d.)]+/, '').trim())
		.filter((line) => line.length > 0);

	return { connection, questions };
}

export async function runDailySummary({
	ctx,
	run,
	notify,
	onUpdated,
	days = 7,
}: {
	ctx: AppContext;
	run: (prompt: string) => Promise<string>;
	notify: (notification: { title: string; body: string }) => void;
	onUpdated: () => void;
	days?: number;
}): Promise<Insight[]> {
	const topics = await listTopics(ctx);
	const created: Insight[] = [];

	for (const topic of topics) {
		const material = await gatherTopicMaterial({ ctx, topicId: topic.id, days });

		if (!material) {
			continue;
		}

		const summary = await run(buildSummaryPrompt({ topicName: topic.name, material }));
		const insight = await createInsight({
			ctx,
			topicId: topic.id,
			type: 'summary',
			content: summary,
		});
		created.push(insight);
	}

	if (created.length > 0) {
		notify({ title: 'Loci daily summary', body: `${created.length} new summary insight(s)` });
		onUpdated();
	}

	return created;
}

export async function runWeeklySynthesis({
	ctx,
	run,
	notify,
	onUpdated,
}: {
	ctx: AppContext;
	run: (prompt: string) => Promise<string>;
	notify: (notification: { title: string; body: string }) => void;
	onUpdated: () => void;
}): Promise<Insight[]> {
	const summaries = await listInsights({ ctx, type: 'summary' });

	if (summaries.length === 0) {
		return [];
	}

	const text = await run(
		buildSynthesisPrompt({ summaries: summaries.map((s) => s.content).join('\n') }),
	);
	const { connection, questions } = parseSynthesis(text);
	const created: Insight[] = [];

	if (connection) {
		created.push(
			await createInsight({ ctx, topicId: null, type: 'connection', content: connection }),
		);
	}

	for (const question of questions) {
		created.push(
			await createInsight({ ctx, topicId: null, type: 'question', content: question }),
		);
	}

	if (created.length > 0) {
		notify({ title: 'Loci weekly synthesis', body: `${created.length} new insight(s)` });
		onUpdated();
	}

	return created;
}
