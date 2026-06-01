import { makeTestDb } from '../../helpers/db';
import { AppContext } from '../../../src/main/context';
import { getSetting, getAllSettings, setSettings } from '../../../src/main/repositories/settings';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('settings repository', () => {
	it('reads a seeded setting', async () => {
		expect(await getSetting(ctx, 'model')).toBe('claude-sonnet-4-6');
		expect(await getSetting(ctx, 'missing')).toBeUndefined();
	});

	it('returns all settings as a record', async () => {
		const all = await getAllSettings(ctx);
		expect(all.claude_path).toBe('claude');
		expect(all.daily_time).toBe('08:00');
	});

	it('upserts settings', async () => {
		await setSettings(ctx, { model: 'claude-haiku-4-5-20251001', daily_time: '09:30' });
		expect(await getSetting(ctx, 'model')).toBe('claude-haiku-4-5-20251001');
		expect(await getSetting(ctx, 'daily_time')).toBe('09:30');
	});
});
