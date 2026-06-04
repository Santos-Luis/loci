import { AppContext } from '../entities/app-context';
import { InsightType } from '../entities/insight';
import { IpcMainLike } from '../entities/ipc';
import {
	listInsights,
	getLatestUnreadInsight,
	countUnreadInsights,
	markAllInsightsRead,
} from '../repositories/insights';

export function registerInsightHandlers({
	ipcMain,
	ctx,
}: {
	ipcMain: IpcMainLike;
	ctx: AppContext;
}): void {
	ipcMain.handle('insights:list', (_event, opts) =>
		listInsights({ ctx, ...(opts as { type?: InsightType; topicId?: number } | undefined) }),
	);
	ipcMain.handle('insights:latestUnread', () => getLatestUnreadInsight(ctx));
	ipcMain.handle('insights:unreadCount', () => countUnreadInsights(ctx));
	ipcMain.handle('insights:markAllRead', () => markAllInsightsRead(ctx));
}
