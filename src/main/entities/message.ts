export type MessageRole = 'user' | 'assistant';

export interface Message {
	id: number;
	conversationId: number;
	role: MessageRole;
	content: string;
	createdAt: string;
}
