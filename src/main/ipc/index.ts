import { AppContext } from '../entities/app-context';
import { IpcMainLike, WindowLike, StreamFn } from '../entities/ipc';
import { registerTopicHandlers } from './topics';
import { registerNoteHandlers } from './notes';
import { registerConversationHandlers } from './conversations';
import { registerAskHandlers } from './ask';
import { registerInsightHandlers } from './insights';
import { registerSettingHandlers } from './settings';
import { registerDashboardHandlers } from './dashboard';

export function registerIpcHandlers({
	ipcMain,
	ctx,
	dataDir,
	getMainWindow,
	stream,
}: {
	ipcMain: IpcMainLike;
	ctx: AppContext;
	dataDir: string;
	getMainWindow: () => WindowLike | null;
	stream: StreamFn;
}): void {
	registerTopicHandlers({ ipcMain, ctx });
	registerNoteHandlers({ ipcMain, ctx });
	registerConversationHandlers({ ipcMain, ctx });
	registerAskHandlers({ ipcMain, ctx, getMainWindow, stream });
	registerInsightHandlers({ ipcMain, ctx });
	registerSettingHandlers({ ipcMain, ctx, dataDir });
	registerDashboardHandlers({ ipcMain, ctx });
}
