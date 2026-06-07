import { contextBridge, ipcRenderer } from 'electron';

const loci = {
	topics: {
		list: () => ipcRenderer.invoke('topics:list'),
		get: (id: number) => ipcRenderer.invoke('topics:get', id),
		create: (input: { name: string; description: string | null }) =>
			ipcRenderer.invoke('topics:create', input),
	},
	notes: {
		list: () => ipcRenderer.invoke('notes:list'),
		listByTopic: (topicId: number) => ipcRenderer.invoke('notes:listByTopic', topicId),
		get: (id: number) => ipcRenderer.invoke('notes:get', id),
		create: (input: { topicId: number | null; title: string; content: string }) =>
			ipcRenderer.invoke('notes:create', input),
		update: (input: { id: number; topicId: number | null; title: string; content: string }) =>
			ipcRenderer.invoke('notes:update', input),
		delete: (id: number) => ipcRenderer.invoke('notes:delete', id),
		search: (query: string) => ipcRenderer.invoke('notes:search', query),
	},
	conversations: {
		list: () => ipcRenderer.invoke('conversations:list'),
		get: (id: number) => ipcRenderer.invoke('conversations:get', id),
		listByTopic: (topicId: number) => ipcRenderer.invoke('conversations:listByTopic', topicId),
		messages: (conversationId: number) =>
			ipcRenderer.invoke('conversations:messages', conversationId),
		update: (input: { id: number; topicId: number | null }) =>
			ipcRenderer.invoke('conversations:update', input),
	},
	ask: {
		send: (payload: {
			conversationId: number | null;
			message: string;
			topicId: number | null;
		}) => ipcRenderer.invoke('ask:send', payload),
		onToken: (callback: (token: string) => void) => {
			const listener = (_event: unknown, token: string): void => callback(token);
			ipcRenderer.on('ask:token', listener);

			return () => {
				ipcRenderer.removeListener('ask:token', listener);
			};
		},
	},
	insights: {
		list: (filter?: { type?: string; topicId?: number }) =>
			ipcRenderer.invoke('insights:list', filter),
		latestUnread: () => ipcRenderer.invoke('insights:latestUnread'),
		unreadCount: () => ipcRenderer.invoke('insights:unreadCount'),
		markAllRead: () => ipcRenderer.invoke('insights:markAllRead'),
		onUpdated: (callback: () => void) => {
			const listener = (): void => callback();
			ipcRenderer.on('insights:updated', listener);

			return () => {
				ipcRenderer.removeListener('insights:updated', listener);
			};
		},
	},
	settings: {
		get: () => ipcRenderer.invoke('settings:get'),
		update: (patch: Record<string, unknown>) => ipcRenderer.invoke('settings:update', patch),
		dataDir: () => ipcRenderer.invoke('settings:dataDir'),
	},
	dashboard: {
		get: () => ipcRenderer.invoke('dashboard:get'),
	},
};

contextBridge.exposeInMainWorld('loci', loci);
