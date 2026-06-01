import { Context } from '../context';

type SettingRow = {
	key: string;
	value: string;
};

export async function getSetting({
	ctx,
	key,
}: {
	ctx: Context;
	key: string;
}): Promise<string | undefined> {
	const row = await ctx.db<SettingRow>('settings').where({ key }).first();

	return row?.value;
}

export async function getAllSettings(ctx: Context): Promise<Record<string, string>> {
	const rows = await ctx.db<SettingRow>('settings').select('key', 'value');

	return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setSettings({
	ctx,
	values,
}: {
	ctx: Context;
	values: Record<string, string>;
}): Promise<void> {
	for (const [key, value] of Object.entries(values)) {
		await ctx.db('settings').insert({ key, value }).onConflict('key').merge({ value });
	}
}
