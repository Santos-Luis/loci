import { AppContext } from '../../../src/main/entities/app-context';
import { makeTestDb } from '../../helpers/db';
import { createTopic } from '../../../src/main/repositories/topics';
import { createNote } from '../../../src/main/repositories/notes';
import { createInsight, listInsights } from '../../../src/main/repositories/insights';
import { parseSynthesis, runDailySummary, runWeeklySynthesis } from '../../../src/main/agent/jobs';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('parseSynthesis', () => {
	it('splits a connection paragraph from a Questions list', () => {
		const text =
			'These topics connect via X.\n\nQuestions:\n- What about Y?\n- How does Z work?';
		const result = parseSynthesis(text);
		expect(result.connection).toContain('connect via X');
		expect(result.questions).toEqual(['What about Y?', 'How does Z work?']);
	});

	it('treats the whole text as a connection when no questions section exists', () => {
		const result = parseSynthesis('Just a connection.');
		expect(result.connection).toBe('Just a connection.');
		expect(result.questions).toEqual([]);
	});
});

describe('runDailySummary', () => {
	it('creates a summary insight per active topic and notifies once', async () => {
		const topic = await createTopic({ ctx, name: 'Space', description: null });
		await createNote({ ctx, topicId: topic.id, title: 'Rovers', content: 'mars rovers' });

		const prompts: string[] = [];
		const notifications: { title: string; body: string }[] = [];
		let updated = 0;

		const created = await runDailySummary({
			ctx,
			run: async (prompt) => {
				prompts.push(prompt);

				return 'A concise summary.';
			},
			notify: (n) => notifications.push(n),
			onUpdated: () => {
				updated += 1;
			},
		});

		expect(created).toHaveLength(1);
		expect(created[0].type).toBe('summary');
		expect(prompts[0]).toContain('mars rovers');
		expect(notifications).toHaveLength(1);
		expect(updated).toBe(1);
	});

	it('does nothing when no topic has activity', async () => {
		await createTopic({ ctx, name: 'Empty', description: null });
		let updated = 0;
		const created = await runDailySummary({
			ctx,
			run: async () => 'unused',
			notify: () => {},
			onUpdated: () => {
				updated += 1;
			},
		});

		expect(created).toEqual([]);
		expect(updated).toBe(0);
	});
});

describe('runWeeklySynthesis', () => {
	it('creates connection and question insights from recent summaries', async () => {
		await createInsight({ ctx, topicId: null, type: 'summary', content: 'summary one' });

		const created = await runWeeklySynthesis({
			ctx,
			run: async () => 'They connect.\n\nQuestions:\n- Why?\n- How?',
			notify: () => {},
			onUpdated: () => {},
		});

		const connections = created.filter((i) => i.type === 'connection');
		const questions = created.filter((i) => i.type === 'question');
		expect(connections).toHaveLength(1);
		expect(questions).toHaveLength(2);

		const stored = await listInsights({ ctx, type: 'question' });
		expect(stored).toHaveLength(2);
	});

	it('does nothing when there are no recent summaries', async () => {
		const created = await runWeeklySynthesis({
			ctx,
			run: async () => 'unused',
			notify: () => {},
			onUpdated: () => {},
		});
		expect(created).toEqual([]);
	});
});
