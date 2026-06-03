import { Note } from './note';
import { Conversation } from './conversation';
import { Insight } from './insight';

export type Topic = {
	id: number;
	name: string;
	description: string | null;
	createdAt: string;
};

export type TopicDetail = {
	topic: Topic;
	notes: Note[];
	conversations: Conversation[];
	insights: Insight[];
};

export type TopicRow = {
	id: number;
	name: string;
	description: string | null;
	created_at: string;
};
