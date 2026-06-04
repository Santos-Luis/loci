import { AppContext } from '../entities/app-context';
import { IpcMainLike } from './types';
import { getDashboard } from '../managers/dashboard';

export function registerDashboardHandlers({
	ipcMain,
	ctx,
}: {
	ipcMain: IpcMainLike;
	ctx: AppContext;
}): void {
	ipcMain.handle('dashboard:get', () => getDashboard(ctx));
}
