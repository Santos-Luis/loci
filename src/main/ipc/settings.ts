import { AppContext } from '../entities/app-context';
import { AppSettings } from '../entities/setting';
import { IpcMainLike } from '../entities/ipc';
import { getSettings, updateSettings } from '../managers/settings';

export function registerSettingHandlers({
	ipcMain,
	ctx,
	dataDir,
}: {
	ipcMain: IpcMainLike;
	ctx: AppContext;
	dataDir: string;
}): void {
	ipcMain.handle('settings:get', () => getSettings(ctx));
	ipcMain.handle('settings:update', (_event, patch) =>
		updateSettings({ ctx, patch: patch as Partial<AppSettings> }),
	);
	ipcMain.handle('settings:dataDir', () => dataDir);
}
