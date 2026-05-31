export interface Note {
	id: number;
	topicId: number | null;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}
