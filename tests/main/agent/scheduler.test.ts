import { AppContext } from '../../../src/main/entities/app-context';
import { makeTestDb } from '../../helpers/db';
import { updateSettings } from '../../../src/main/managers/settings';
import { startAgent } from '../../../src/main/agent/scheduler';

let ctx: AppContext;

beforeEach(async () => {
	ctx = { db: await makeTestDb() };
});

afterEach(async () => {
	await ctx.db.destroy();
});

describe('startAgent', () => {
	it('schedules both jobs with cron expressions from settings when enabled', async () => {
		const scheduled: string[] = [];
		const fakeSchedule = (expr: string) => {
			scheduled.push(expr);

			return { stop: () => {} };
		};

		await startAgent({
			ctx,
			run: async () => '',
			notify: () => {},
			onUpdated: () => {},
			schedule: fakeSchedule,
		});

		expect(scheduled).toContain('0 8 * * *');
		expect(scheduled).toContain('0 17 * * 5');
	});

	it('skips disabled jobs', async () => {
		await updateSettings({ ctx, patch: { dailyEnabled: false, weeklyEnabled: false } });
		const scheduled: string[] = [];
		const fakeSchedule = (expr: string) => {
			scheduled.push(expr);

			return { stop: () => {} };
		};

		const handle = await startAgent({
			ctx,
			run: async () => '',
			notify: () => {},
			onUpdated: () => {},
			schedule: fakeSchedule,
		});

		expect(scheduled).toEqual([]);
		handle.stop();
	});
});
