import {
	Topic,
	TopicDetail,
	Note,
	Conversation,
	Message,
	Insight,
	InsightType,
	SearchHit,
	AppSettings,
	DashboardData,
	AskResult,
} from './types';

export type LociApi = {
	topics: {
		list: () => Promise<Topic[]>;
		get: (id: number) => Promise<TopicDetail | null>;
		create: (input: { name: string; description: string | null }) => Promise<Topic>;
	};
	notes: {
		list: () => Promise<Note[]>;
		listByTopic: (topicId: number) => Promise<Note[]>;
		get: (id: number) => Promise<Note | undefined>;
		create: (input: {
			topicId: number | null;
			title: string;
			content: string;
		}) => Promise<Note>;
		update: (input: {
			id: number;
			topicId: number | null;
			title: string;
			content: string;
		}) => Promise<Note>;
		delete: (id: number) => Promise<void>;
		search: (query: string) => Promise<SearchHit[]>;
	};
	conversations: {
		list: () => Promise<Conversation[]>;
		get: (id: number) => Promise<Conversation | undefined>;
		listByTopic: (topicId: number) => Promise<Conversation[]>;
		messages: (conversationId: number) => Promise<Message[]>;
	};
	ask: {
		send: (payload: {
			conversationId: number | null;
			message: string;
			topicId: number | null;
		}) => Promise<AskResult>;
		onToken: (callback: (token: string) => void) => () => void;
	};
	insights: {
		list: (filter?: { type?: InsightType; topicId?: number }) => Promise<Insight[]>;
		latestUnread: () => Promise<Insight | undefined>;
		unreadCount: () => Promise<number>;
		markAllRead: () => Promise<void>;
		onUpdated: (callback: () => void) => () => void;
	};
	settings: {
		get: () => Promise<AppSettings>;
		update: (patch: Partial<AppSettings>) => Promise<AppSettings>;
		dataDir: () => Promise<string>;
	};
	dashboard: {
		get: () => Promise<DashboardData>;
	};
};

declare global {
	interface Window {
		loci: LociApi;
	}
}
