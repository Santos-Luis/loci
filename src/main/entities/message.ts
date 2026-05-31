export type MessageRole = 'user' | 'assistant';

export type Message = {
	id: number;
	conversationId: number;
	role: MessageRole;
	content: string;
	createdAt: string;
};
