import {
	buildAskPrompt,
	buildSummaryPrompt,
	buildSynthesisPrompt,
} from '../../../src/main/managers/prompt';
import { Topic } from '../../../src/main/entities/topic';

const topics: Topic[] = [{ id: 1, name: 'Space', description: 'astronomy', createdAt: 'now' }];

describe('buildAskPrompt', () => {
	it('includes topics, retrieved memory, recent messages, and the question', () => {
		const prompt = buildAskPrompt({
			topics,
			context: {
				hits: [
					{
						source: 'note',
						id: 1,
						topicId: 1,
						title: 'Mars',
						content: 'red planet',
						score: -2,
					},
				],
				recentMessages: [
					{ id: 1, conversationId: 1, role: 'user', content: 'hi', createdAt: 'now' },
				],
			},
			question: 'What is Mars?',
		});

		expect(prompt).toContain('Space');
		expect(prompt).toContain('red planet');
		expect(prompt).toContain('hi');
		expect(prompt).toContain('What is Mars?');
	});

	it('still works with no topics and empty context', () => {
		const prompt = buildAskPrompt({
			topics: [],
			context: { hits: [], recentMessages: [] },
			question: 'Hello?',
		});
		expect(prompt).toContain('Hello?');
	});
});

describe('buildSummaryPrompt', () => {
	it('asks for a concise synthesis of the supplied material', () => {
		const prompt = buildSummaryPrompt({
			topicName: 'Space',
			material: 'note: rovers landed',
		});
		expect(prompt).toContain('Space');
		expect(prompt).toContain('rovers landed');
		expect(prompt.toLowerCase()).toContain('summary');
	});
});

describe('buildSynthesisPrompt', () => {
	it('asks for cross-topic connections and questions', () => {
		const prompt = buildSynthesisPrompt({ summaries: 'summary A\nsummary B' });
		expect(prompt).toContain('summary A');
		expect(prompt.toLowerCase()).toContain('connection');
		expect(prompt.toLowerCase()).toContain('question');
	});
});
