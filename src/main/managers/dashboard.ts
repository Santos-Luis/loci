import { AppContext } from '../entities/app-context';
import { DashboardData } from '../entities/dashboard';
import { getLatestUnreadInsight } from '../repositories/insights';
import { listConversations } from '../repositories/conversations';
import { listNotes } from '../repositories/notes';

export async function getDashboard(ctx: AppContext): Promise<DashboardData> {
	const [latestInsight, recentConversations, notes] = await Promise.all([
		getLatestUnreadInsight(ctx),
		listConversations({ ctx, limit: 3 }),
		listNotes(ctx),
	]);

	return {
		latestInsight: latestInsight ?? null,
		recentConversations,
		lastNote: notes[0] ?? null,
	};
}
