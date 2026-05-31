import { Knex } from 'knex';

type SettingRow = {
	key: string;
	value: string;
};

export async function getSetting(db: Knex, key: string): Promise<string | undefined> {
	const row = await db<SettingRow>('settings').where({ key }).first();

	return row?.value;
}

export async function getAllSettings(db: Knex): Promise<Record<string, string>> {
	const rows = await db<SettingRow>('settings').select('key', 'value');

	return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setSettings(db: Knex, values: Record<string, string>): Promise<void> {
	for (const [key, value] of Object.entries(values)) {
		await db('settings').insert({ key, value }).onConflict('key').merge({ value });
	}
}
