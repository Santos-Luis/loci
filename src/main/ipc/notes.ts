import { AppContext } from '../entities/app-context';
import { IpcMainLike } from '../entities/ipc';
import { listNotes, listNotesByTopic, getNote, deleteNote } from '../repositories/notes';
import { createNoteChecked, updateNoteChecked, searchNotesByText } from '../managers/notes';

export function registerNoteHandlers({
	ipcMain,
	ctx,
}: {
	ipcMain: IpcMainLike;
	ctx: AppContext;
}): void {
	ipcMain.handle('notes:list', () => listNotes(ctx));
	ipcMain.handle('notes:listByTopic', (_event, topicId) =>
		listNotesByTopic({ ctx, topicId: topicId as number }),
	);
	ipcMain.handle('notes:get', (_event, id) => getNote({ ctx, id: id as number }));
	ipcMain.handle('notes:create', (_event, input) =>
		createNoteChecked({
			ctx,
			...(input as { topicId: number | null; title: string; content: string }),
		}),
	);
	ipcMain.handle('notes:update', (_event, input) =>
		updateNoteChecked({
			ctx,
			...(input as { id: number; topicId: number | null; title: string; content: string }),
		}),
	);
	ipcMain.handle('notes:delete', (_event, id) => deleteNote({ ctx, id: id as number }));
	ipcMain.handle('notes:search', (_event, query) =>
		searchNotesByText({ ctx, query: query as string }),
	);
}
