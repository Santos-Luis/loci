export type InsightType = 'summary' | 'connection' | 'question';

export type Insight = {
	id: number;
	topicId: number | null;
	type: InsightType;
	content: string;
	generatedAt: string;
	readAt: string | null;
};
