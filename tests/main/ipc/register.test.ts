import { AppContext } from '../../../src/main/entities/app-context';
import { makeTestDb } from '../../helpers/db';
import { registerIpcHandlers } from '../../../src/main/ipc';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('registerIpcHandlers', () => {
	it('registers every expected channel exactly once', () => {
		const channels: string[] = [];
		const ipcMain = {
			handle: (channel: string) => {
				channels.push(channel);
			},
		};

		registerIpcHandlers({
			ipcMain,
			ctx,
			dataDir: '/tmp/loci-test',
			getMainWindow: () => null,
			stream: async () => '',
		});

		const expected = [
			'topics:list',
			'topics:get',
			'topics:create',
			'notes:list',
			'notes:listByTopic',
			'notes:get',
			'notes:create',
			'notes:update',
			'notes:delete',
			'notes:search',
			'conversations:list',
			'conversations:get',
			'conversations:listByTopic',
			'conversations:messages',
			'ask:send',
			'insights:list',
			'insights:latestUnread',
			'insights:unreadCount',
			'insights:markAllRead',
			'settings:get',
			'settings:update',
			'settings:dataDir',
			'dashboard:get',
		];

		for (const channel of expected) {
			expect(channels.filter((c) => c === channel)).toHaveLength(1);
		}
	});
});
