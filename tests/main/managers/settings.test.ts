import { AppContext } from '../../../src/main/entities/app-context';
import { makeTestDb } from '../../helpers/db';
import { getSettings, updateSettings } from '../../../src/main/managers/settings';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('settings manager', () => {
	it('returns typed settings with seeded defaults', async () => {
		const settings = await getSettings(ctx);
		expect(settings.claudePath).toBe('claude');
		expect(settings.model).toBe('claude-sonnet-4-6');
		expect(settings.dailyEnabled).toBe(true);
		expect(settings.dailyTime).toBe('08:00');
		expect(settings.weeklyDay).toBe(5);
	});

	it('persists a partial update and returns the merged result', async () => {
		const updated = await updateSettings({
			ctx,
			patch: { model: 'claude-haiku-4-5-20251001', dailyEnabled: false },
		});
		expect(updated.model).toBe('claude-haiku-4-5-20251001');
		expect(updated.dailyEnabled).toBe(false);
		expect(updated.weeklyTime).toBe('17:00');

		const reread = await getSettings(ctx);
		expect(reread.model).toBe('claude-haiku-4-5-20251001');
	});

	it('rejects an invalid time', async () => {
		await expect(updateSettings({ ctx, patch: { dailyTime: '25:99' } })).rejects.toThrow();
	});

	it('rejects an out-of-range weekday', async () => {
		await expect(updateSettings({ ctx, patch: { weeklyDay: 9 } })).rejects.toThrow();
	});
});
