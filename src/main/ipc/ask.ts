import { AppContext } from '../entities/app-context';
import { Message } from '../entities/message';
import { RetrievedContext } from '../entities/context';
import { IpcMainLike, WindowLike, StreamFn } from '../entities/ipc';
import { getSettings } from '../managers/settings';
import { prepareAsk, completeAsk } from '../managers/ask';

export async function handleAsk({
	ctx,
	stream,
	sendToken,
	conversationId,
	message,
	topicId,
}: {
	ctx: AppContext;
	stream: StreamFn;
	sendToken: (token: string) => void;
	conversationId: number | null;
	message: string;
	topicId: number | null;
}): Promise<{ conversationId: number; message: Message; context: RetrievedContext }> {
	const settings = await getSettings(ctx);
	const prepared = await prepareAsk({ ctx, conversationId, message, topicId });

	const text = await stream({
		claudePath: settings.claudePath,
		model: settings.model,
		prompt: prepared.prompt,
		onToken: sendToken,
	});

	const assistantMessage = await completeAsk({
		ctx,
		conversationId: prepared.conversationId,
		content: text,
	});

	return {
		conversationId: prepared.conversationId,
		message: assistantMessage,
		context: prepared.context,
	};
}

export function registerAskHandlers({
	ipcMain,
	ctx,
	getMainWindow,
	stream,
}: {
	ipcMain: IpcMainLike;
	ctx: AppContext;
	getMainWindow: () => WindowLike | null;
	stream: StreamFn;
}): void {
	ipcMain.handle('ask:send', (_event, payload) => {
		const { conversationId, message, topicId } = payload as {
			conversationId: number | null;
			message: string;
			topicId: number | null;
		};

		return handleAsk({
			ctx,
			stream,
			sendToken: (token) => getMainWindow()?.webContents.send('ask:token', token),
			conversationId,
			message,
			topicId,
		});
	});
}
