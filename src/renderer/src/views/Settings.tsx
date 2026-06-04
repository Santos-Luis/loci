import { useEffect, useState } from 'react';
import { AppSettings } from '../lib/types';
import { loci } from '../lib/api';

const MODELS = [
	{ value: 'claude-sonnet-4-6', label: 'Sonnet' },
	{ value: 'claude-haiku-4-5-20251001', label: 'Haiku' },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function Settings() {
	const [settings, setSettings] = useState<AppSettings | null>(null);
	const [dataDir, setDataDir] = useState('');
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		void loci().settings.get().then(setSettings);
		void loci().settings.dataDir().then(setDataDir);
	}, []);

	if (!settings) {
		return (
			<section data-testid="view-settings">
				<h2>Settings</h2>
				<p>Loading...</p>
			</section>
		);
	}

	const update = (patch: Partial<AppSettings>): void => {
		setSettings({ ...settings, ...patch });
		setSaved(false);
	};

	const save = async (): Promise<void> => {
		const updated = await loci().settings.update(settings);
		setSettings(updated);
		setSaved(true);
	};

	return (
		<section data-testid="view-settings">
			<h2>Settings</h2>
			<div className="card">
				<label>
					Claude CLI path
					<input
						value={settings.claudePath}
						onChange={(e) => update({ claudePath: e.target.value })}
					/>
				</label>
			</div>
			<div className="card">
				<label>
					Model
					<select
						value={settings.model}
						onChange={(e) => update({ model: e.target.value })}
					>
						{MODELS.map((m) => (
							<option key={m.value} value={m.value}>
								{m.label}
							</option>
						))}
					</select>
				</label>
			</div>
			<div className="card">
				<h3>Daily summary</h3>
				<label>
					<input
						type="checkbox"
						checked={settings.dailyEnabled}
						onChange={(e) => update({ dailyEnabled: e.target.checked })}
					/>{' '}
					Enabled
				</label>
				<label>
					Time
					<input
						type="time"
						value={settings.dailyTime}
						onChange={(e) => update({ dailyTime: e.target.value })}
					/>
				</label>
			</div>
			<div className="card">
				<h3>Weekly synthesis</h3>
				<label>
					<input
						type="checkbox"
						checked={settings.weeklyEnabled}
						onChange={(e) => update({ weeklyEnabled: e.target.checked })}
					/>{' '}
					Enabled
				</label>
				<label>
					Day
					<select
						value={settings.weeklyDay}
						onChange={(e) => update({ weeklyDay: Number(e.target.value) })}
					>
						{DAYS.map((day, index) => (
							<option key={day} value={index}>
								{day}
							</option>
						))}
					</select>
				</label>
				<label>
					Time
					<input
						type="time"
						value={settings.weeklyTime}
						onChange={(e) => update({ weeklyTime: e.target.value })}
					/>
				</label>
			</div>
			<div className="card">
				<label>
					Data directory
					<input value={dataDir} readOnly />
				</label>
				<p style={{ color: '#9aa0ad', marginTop: 4 }}>
					Set via the <code>LOCI_DATA_DIR</code> environment variable (default{' '}
					<code>~/.loci</code>
					).
				</p>
			</div>
			<button onClick={() => void save()}>Save</button>
			{saved && (
				<span style={{ marginLeft: 8 }}>Saved. Schedule changes apply after restart.</span>
			)}
		</section>
	);
}
