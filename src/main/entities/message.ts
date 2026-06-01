export type MessageRole = 'user' | 'assistant';

export type Message = {
	id: number;
	conversationId: number;
	role: MessageRole;
	content: string;
	createdAt: string;
};

export type MessageRow = {
	id: number;
	conversation_id: number;
	role: MessageRole;
	content: string;
	created_at: string;
};
