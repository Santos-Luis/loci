export type SearchSource = 'note' | 'message' | 'insight';

export type SearchHit = {
	source: SearchSource;
	id: number;
	topicId: number | null;
	title: string | null;
	content: string;
	score: number;
};
