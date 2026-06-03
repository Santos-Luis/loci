import { AppContext } from '../entities/app-context';
import { Topic, TopicDetail } from '../entities/topic';
import { createTopic, getTopic } from '../repositories/topics';
import { listNotesByTopic } from '../repositories/notes';
import { listConversationsByTopic } from '../repositories/conversations';
import { listInsights } from '../repositories/insights';

export async function createTopicChecked({
	ctx,
	name,
	description,
}: {
	ctx: AppContext;
	name: string;
	description: string | null;
}): Promise<Topic> {
	const trimmedName = name.trim();

	if (!trimmedName) {
		throw new Error('Topic name cannot be blank');
	}

	const normalisedDescription =
		description === null || description.trim() === '' ? null : description.trim();

	return createTopic({ ctx, name: trimmedName, description: normalisedDescription });
}

export async function getTopicDetail({
	ctx,
	id,
}: {
	ctx: AppContext;
	id: number;
}): Promise<TopicDetail | null> {
	const topic = await getTopic({ ctx, id });

	if (!topic) {
		return null;
	}

	const [notes, conversations, insights] = await Promise.all([
		listNotesByTopic({ ctx, topicId: id }),
		listConversationsByTopic({ ctx, topicId: id }),
		listInsights({ ctx, topicId: id }),
	]);

	return { topic, notes, conversations, insights };
}
