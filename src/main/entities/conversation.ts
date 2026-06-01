export type Conversation = {
	id: number;
	topicId: number | null;
	title: string;
	createdAt: string;
};

export type ConversationRow = {
	id: number;
	topic_id: number | null;
	title: string;
	created_at: string;
};
