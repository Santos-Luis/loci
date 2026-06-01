import { Topic } from '../entities/topic';
import { RetrievedContext } from '../entities/context';

export function buildAskPrompt({
	topics,
	context,
	question,
}: {
	topics: Topic[];
	context: RetrievedContext;
	question: string;
}): string {
	return [
		'You are Loci, a personal knowledge assistant. Answer the user grounded in their own',
		'accumulated notes, past conversations, and insights below. If the memory is irrelevant,',
		'answer from general knowledge and say so briefly.',
		'',
		'## Topics the user follows',
		renderTopics(topics),
		'',
		'## Relevant memory',
		renderHits(context),
		'',
		'## Recent conversation',
		renderHistory(context),
		'',
		'## Question',
		question,
	].join('\n');
}

export function buildSummaryPrompt({
	topicName,
	material,
}: {
	topicName: string;
	material: string;
}): string {
	return [
		`Write a concise summary of the recent activity for the topic "${topicName}".`,
		'Focus on what changed, what is interesting, and any open threads. Keep it to a short paragraph.',
		'',
		'## Material',
		material,
	].join('\n');
}

export function buildSynthesisPrompt({ summaries }: { summaries: string }): string {
	return [
		'Below are recent per-topic summaries from a personal knowledge base.',
		'Identify cross-topic connections, then surface 2-3 thought-provoking questions worth exploring.',
		'Return prose: first the connections, then a "Questions:" list.',
		'',
		'## Summaries',
		summaries,
	].join('\n');
}

function renderTopics(topics: Topic[]): string {
	if (topics.length === 0) {
		return '(none yet)';
	}

	return topics.map((t) => `- ${t.name}${t.description ? `: ${t.description}` : ''}`).join('\n');
}

function renderHits(context: RetrievedContext): string {
	if (context.hits.length === 0) {
		return '(no relevant memory found)';
	}

	const maxHitChars = 500;

	return context.hits
		.map((h) => {
			const label = h.title ? `[${h.source}] ${h.title}` : `[${h.source}]`;
			const body = h.content.slice(0, maxHitChars);

			return `${label}: ${body}`;
		})
		.join('\n');
}

function renderHistory(context: RetrievedContext): string {
	if (context.recentMessages.length === 0) {
		return '(new conversation)';
	}

	return context.recentMessages.map((m) => `${m.role}: ${m.content}`).join('\n');
}
