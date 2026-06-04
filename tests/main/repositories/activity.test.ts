import { AppContext } from '../../../src/main/entities/app-context';
import { makeTestDb } from '../../helpers/db';
import { createTopic } from '../../../src/main/repositories/topics';
import { createNote } from '../../../src/main/repositories/notes';
import { createConversation } from '../../../src/main/repositories/conversations';
import { createMessage } from '../../../src/main/repositories/messages';
import { gatherTopicMaterial } from '../../../src/main/repositories/activity';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('gatherTopicMaterial', () => {
	it('combines recent notes and messages for a topic into one string', async () => {
		const topic = await createTopic({ ctx, name: 'Space', description: null });
		await createNote({ ctx, topicId: topic.id, title: 'Rovers', content: 'mars rovers' });
		const conv = await createConversation({ ctx, topicId: topic.id, title: 'chat' });
		await createMessage({
			ctx,
			conversationId: conv.id,
			role: 'user',
			content: 'about comets',
		});

		const material = await gatherTopicMaterial({ ctx, topicId: topic.id, days: 7 });
		expect(material).toContain('mars rovers');
		expect(material).toContain('about comets');
	});

	it('returns an empty string when there is no recent activity', async () => {
		const topic = await createTopic({ ctx, name: 'Empty', description: null });
		expect(await gatherTopicMaterial({ ctx, topicId: topic.id, days: 7 })).toBe('');
	});
});
