import { AppContext } from '../../../src/main/entities/app-context';
import { makeTestDb } from '../../helpers/db';
import { handleAsk } from '../../../src/main/ipc/ask';
import { listMessages } from '../../../src/main/repositories/messages';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('handleAsk', () => {
	it('streams tokens, persists both messages, and returns the context', async () => {
		const tokens: string[] = [];
		const result = await handleAsk(
			{
				ctx,
				stream: async ({ prompt, onToken }) => {
					expect(prompt).toContain('Tell me about bees');
					onToken('Bees ');
					onToken('buzz.');

					return 'Bees buzz.';
				},
				sendToken: (t) => tokens.push(t),
			},
			{ conversationId: null, message: 'Tell me about bees', topicId: null },
		);

		expect(tokens).toEqual(['Bees ', 'buzz.']);
		expect(result.message.role).toBe('assistant');
		expect(result.message.content).toBe('Bees buzz.');
		expect(result.context).toHaveProperty('hits');

		const stored = await listMessages({ ctx, conversationId: result.conversationId });
		expect(stored.map((m) => m.role)).toEqual(['user', 'assistant']);
	});
});
