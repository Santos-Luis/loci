export type Note = {
	id: number;
	topicId: number | null;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
};

export type NoteRow = {
	id: number;
	topic_id: number | null;
	title: string;
	content: string;
	created_at: string;
	updated_at: string;
};
