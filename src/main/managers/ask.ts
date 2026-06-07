import { AppContext } from '../entities/app-context';
import { Message } from '../entities/message';
import { RetrievedContext } from '../entities/context';
import { createConversation, getConversation } from '../repositories/conversations';
import { createMessage } from '../repositories/messages';
import { listTopics } from '../repositories/topics';
import { retrieveContext } from './retrieval';
import { buildAskPrompt } from './prompt';

export function conversationTitle(message: string): string {
	return message.trim().slice(0, 60);
}

export async function prepareAsk({
	ctx,
	conversationId,
	message,
	topicId,
}: {
	ctx: AppContext;
	conversationId: number | null;
	message: string;
	topicId: number | null;
}): Promise<{ conversationId: number; prompt: string; context: RetrievedContext }> {
	let resolvedConversationId = conversationId;
	let resolvedTopicId = topicId;

	if (resolvedConversationId === null) {
		const title = conversationTitle(message);
		const conversation = await createConversation({ ctx, topicId, title });
		resolvedConversationId = conversation.id;
	} else {
		const conversation = await getConversation({ ctx, id: resolvedConversationId });
		resolvedTopicId = conversation?.topicId ?? null;
	}

	await createMessage({
		ctx,
		conversationId: resolvedConversationId,
		role: 'user',
		content: message,
	});

	const context = await retrieveContext({
		ctx,
		query: message,
		conversationId: resolvedConversationId,
		topicId: resolvedTopicId,
	});

	const topics = await listTopics(ctx);

	const prompt = buildAskPrompt({ topics, context, question: message });

	return { conversationId: resolvedConversationId, prompt, context };
}

export async function completeAsk({
	ctx,
	conversationId,
	content,
}: {
	ctx: AppContext;
	conversationId: number;
	content: string;
}): Promise<Message> {
	return createMessage({ ctx, conversationId, role: 'assistant', content });
}
