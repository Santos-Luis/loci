import { AppContext } from '../entities/app-context';
import { AppSettings } from '../entities/setting';
import { getAllSettings, setSettings } from '../repositories/settings';

export type { AppSettings };

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function getSettings(ctx: AppContext): Promise<AppSettings> {
	const raw = await getAllSettings(ctx);

	return {
		claudePath: raw.claude_path ?? 'claude',
		model: raw.model ?? 'claude-sonnet-4-6',
		dailyEnabled: parseBool(raw.daily_enabled, true),
		dailyTime: raw.daily_time ?? '08:00',
		weeklyEnabled: parseBool(raw.weekly_enabled, true),
		weeklyDay: raw.weekly_day !== undefined ? Number(raw.weekly_day) : 5,
		weeklyTime: raw.weekly_time ?? '17:00',
	};
}

export async function updateSettings({
	ctx,
	patch,
}: {
	ctx: AppContext;
	patch: Partial<AppSettings>;
}): Promise<AppSettings> {
	if (patch.dailyTime !== undefined && !TIME_PATTERN.test(patch.dailyTime)) {
		throw new Error(`invalid dailyTime: ${patch.dailyTime}`);
	}

	if (patch.weeklyTime !== undefined && !TIME_PATTERN.test(patch.weeklyTime)) {
		throw new Error(`invalid weeklyTime: ${patch.weeklyTime}`);
	}

	if (patch.weeklyDay !== undefined && (patch.weeklyDay < 0 || patch.weeklyDay > 6)) {
		throw new Error(`invalid weeklyDay: ${patch.weeklyDay}`);
	}

	const serialised = {
		...(patch.claudePath !== undefined && { claude_path: patch.claudePath }),
		...(patch.model !== undefined && { model: patch.model }),
		...(patch.dailyEnabled !== undefined && { daily_enabled: patch.dailyEnabled ? '1' : '0' }),
		...(patch.dailyTime !== undefined && { daily_time: patch.dailyTime }),
		...(patch.weeklyEnabled !== undefined && {
			weekly_enabled: patch.weeklyEnabled ? '1' : '0',
		}),
		...(patch.weeklyDay !== undefined && { weekly_day: String(patch.weeklyDay) }),
		...(patch.weeklyTime !== undefined && { weekly_time: patch.weeklyTime }),
	};

	await setSettings({ ctx, values: serialised });

	return getSettings(ctx);
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
	if (value === undefined) return fallback;

	return value === '1';
}
