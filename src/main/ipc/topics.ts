import { AppContext } from '../entities/app-context';
import { IpcMainLike } from '../entities/ipc';
import { listTopics } from '../repositories/topics';
import { createTopicChecked, getTopicDetail } from '../managers/topics';

export function registerTopicHandlers({
	ipcMain,
	ctx,
}: {
	ipcMain: IpcMainLike;
	ctx: AppContext;
}): void {
	ipcMain.handle('topics:list', () => listTopics(ctx));
	ipcMain.handle('topics:get', (_event, id) => getTopicDetail({ ctx, id: id as number }));
	ipcMain.handle('topics:create', (_event, input) =>
		createTopicChecked({ ctx, ...(input as { name: string; description: string | null }) }),
	);
}
