import { AppContext } from '../entities/app-context';
import { getSettings } from '../managers/settings';
import { dailyCron, weeklyCron } from './cron';
import { runDailySummary, runWeeklySynthesis } from './jobs';

type ScheduledTask = {
	stop: () => void;
};

type ScheduleFn = (expression: string, task: () => void) => ScheduledTask;

export type AgentHandle = {
	stop: () => void;
};

export async function startAgent({
	ctx,
	run,
	notify,
	onUpdated,
	schedule,
}: {
	ctx: AppContext;
	run: (prompt: string) => Promise<string>;
	notify: (notification: { title: string; body: string }) => void;
	onUpdated: () => void;
	schedule: ScheduleFn;
}): Promise<AgentHandle> {
	const settings = await getSettings(ctx);
	const tasks: ScheduledTask[] = [];

	if (settings.dailyEnabled) {
		tasks.push(
			schedule(dailyCron(settings.dailyTime), () => {
				void runDailySummary({ ctx, run, notify, onUpdated });
			}),
		);
	}

	if (settings.weeklyEnabled) {
		tasks.push(
			schedule(weeklyCron({ day: settings.weeklyDay, time: settings.weeklyTime }), () => {
				void runWeeklySynthesis({ ctx, run, notify, onUpdated });
			}),
		);
	}

	return {
		stop: () => {
			for (const task of tasks) {
				task.stop();
			}
		},
	};
}
