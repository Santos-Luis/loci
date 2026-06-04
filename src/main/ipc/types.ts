export type IpcMainLike = {
	handle(
		channel: string,
		listener: (event: unknown, payload?: unknown) => unknown | Promise<unknown>,
	): void;
};

export type WindowLike = {
	webContents: { send: (channel: string, ...args: unknown[]) => void };
};
