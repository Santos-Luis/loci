export type IpcMainLike = {
	handle(
		channel: string,
		listener: (event: unknown, payload?: unknown) => unknown | Promise<unknown>,
	): void;
};

export type WindowLike = {
	webContents: { send: (channel: string, ...args: unknown[]) => void };
};

export type StreamFn = (opts: {
	claudePath: string;
	model: string;
	prompt: string;
	onToken: (token: string) => void;
}) => Promise<string>;
