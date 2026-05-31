import type { Topic } from '../../../src/main/entities/topic';
import type { Note } from '../../../src/main/entities/note';
import type { Conversation } from '../../../src/main/entities/conversation';
import type { Message, MessageRole } from '../../../src/main/entities/message';
import type { Insight, InsightType } from '../../../src/main/entities/insight';
import type { Setting } from '../../../src/main/entities/setting';
import type { SearchHit, SearchSource } from '../../../src/main/entities/search';
import type { RetrievedContext } from '../../../src/main/entities/context';

describe('entities', () => {
	it('compose into valid objects', () => {
		const topic: Topic = { id: 1, name: 'AI', description: null, createdAt: 'now' };
		const note: Note = {
			id: 1,
			topicId: 1,
			title: 't',
			content: 'c',
			createdAt: 'now',
			updatedAt: 'now',
		};
		const conversation: Conversation = { id: 1, topicId: null, title: 'c', createdAt: 'now' };
		const role: MessageRole = 'user';
		const message: Message = {
			id: 1,
			conversationId: 1,
			role,
			content: 'hi',
			createdAt: 'now',
		};
		const type: InsightType = 'summary';
		const insight: Insight = {
			id: 1,
			topicId: null,
			type,
			content: 'c',
			generatedAt: 'now',
			readAt: null,
		};
		const setting: Setting = { key: 'model', value: 'claude-sonnet-4-6' };
		const source: SearchSource = 'note';
		const hit: SearchHit = { source, id: 1, topicId: 1, title: 't', content: 'c', score: -1.2 };
		const context: RetrievedContext = { hits: [hit], recentMessages: [message] };

		expect([topic, note, conversation, message, insight, setting, hit, context]).toHaveLength(
			8,
		);
	});
});
