export type MessageRole = 'user' | 'assistant';
export type InsightType = 'summary' | 'connection' | 'question';
export type SearchSource = 'note' | 'message' | 'insight';

export type Topic = {
	id: number;
	name: string;
	description: string | null;
	createdAt: string;
};

export type Note = {
	id: number;
	topicId: number | null;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
};

export type Conversation = {
	id: number;
	topicId: number | null;
	title: string;
	createdAt: string;
};

export type Message = {
	id: number;
	conversationId: number;
	role: MessageRole;
	content: string;
	createdAt: string;
};

export type Insight = {
	id: number;
	topicId: number | null;
	type: InsightType;
	content: string;
	generatedAt: string;
	readAt: string | null;
};

export type SearchHit = {
	source: SearchSource;
	id: number;
	topicId: number | null;
	title: string | null;
	content: string;
	score: number;
};

export type RetrievedContext = {
	hits: SearchHit[];
	recentMessages: Message[];
};

export type AppSettings = {
	claudePath: string;
	model: string;
	dailyEnabled: boolean;
	dailyTime: string;
	weeklyEnabled: boolean;
	weeklyDay: number;
	weeklyTime: string;
};

export type TopicDetail = {
	topic: Topic;
	notes: Note[];
	conversations: Conversation[];
	insights: Insight[];
};

export type DashboardData = {
	latestInsight: Insight | null;
	recentConversations: Conversation[];
	lastNote: Note | null;
};

export type AskResult = {
	conversationId: number;
	message: Message;
	context: RetrievedContext;
};
