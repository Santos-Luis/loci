export type InsightType = 'summary' | 'connection' | 'question';

export type Insight = {
	id: number;
	topicId: number | null;
	type: InsightType;
	content: string;
	generatedAt: string;
	readAt: string | null;
};

export type InsightRow = {
	id: number;
	topic_id: number | null;
	type: InsightType;
	content: string;
	generated_at: string;
	read_at: string | null;
};
