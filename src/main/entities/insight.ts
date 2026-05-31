export type InsightType = 'summary' | 'connection' | 'question';

export interface Insight {
	id: number;
	topicId: number | null;
	type: InsightType;
	content: string;
	generatedAt: string;
	readAt: string | null;
}
