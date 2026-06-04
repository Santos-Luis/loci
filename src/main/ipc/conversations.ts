import { AppContext } from '../entities/app-context';
import { IpcMainLike } from './types';
import {
	listConversations,
	getConversation,
	listConversationsByTopic,
} from '../repositories/conversations';
import { listMessages } from '../repositories/messages';

export function registerConversationHandlers({
	ipcMain,
	ctx,
}: {
	ipcMain: IpcMainLike;
	ctx: AppContext;
}): void {
	ipcMain.handle('conversations:list', (_event, limit) =>
		listConversations({ ctx, limit: (limit as number | undefined) ?? 50 }),
	);
	ipcMain.handle('conversations:get', (_event, id) => getConversation({ ctx, id: id as number }));
	ipcMain.handle('conversations:listByTopic', (_event, topicId) =>
		listConversationsByTopic({ ctx, topicId: topicId as number }),
	);
	ipcMain.handle('conversations:messages', (_event, conversationId) =>
		listMessages({ ctx, conversationId: conversationId as number }),
	);
}
