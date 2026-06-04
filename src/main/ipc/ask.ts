import { AppContext } from '../entities/app-context';
import { Message } from '../entities/message';
import { RetrievedContext } from '../entities/context';
import { getSettings } from '../managers/settings';
import { prepareAsk, completeAsk } from '../managers/ask';
import { IpcMainLike, WindowLike } from './types';

export type StreamFn = (opts: {
	claudePath: string;
	model: string;
	prompt: string;
	onToken: (token: string) => void;
}) => Promise<string>;

export type AskPayload = {
	conversationId: number | null;
	message: string;
	topicId: number | null;
};

export type AskResult = {
	conversationId: number;
	message: Message;
	context: RetrievedContext;
};

export async function handleAsk(
	{
		ctx,
		stream,
		sendToken,
	}: { ctx: AppContext; stream: StreamFn; sendToken: (token: string) => void },
	{ conversationId, message, topicId }: AskPayload,
): Promise<AskResult> {
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
	ipcMain.handle('ask:send', (_event, payload) =>
		handleAsk(
			{
				ctx,
				stream,
				sendToken: (token) => getMainWindow()?.webContents.send('ask:token', token),
			},
			payload as AskPayload,
		),
	);
}
