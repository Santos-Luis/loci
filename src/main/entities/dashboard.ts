import { Insight } from './insight';
import { Conversation } from './conversation';
import { Note } from './note';

export type DashboardData = {
	latestInsight: Insight | null;
	recentConversations: Conversation[];
	lastNote: Note | null;
};
