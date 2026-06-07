import { useEffect, useState } from 'react';
import { AppSettings } from '../lib/types';
import { loci } from '../lib/api';

const MODELS = [
	{ value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
	{ value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
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
				<h1 className="page-title">Settings</h1>
				<p className="muted">Loading…</p>
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
			<h1 className="page-title">Settings</h1>

			<div className="card">
				<p className="card-title">Claude</p>
				<div className="settings-section">
					<div className="field">
						<label className="field-label" htmlFor="claude-path">
							CLI path
						</label>
						<input
							id="claude-path"
							value={settings.claudePath}
							onChange={(e) => update({ claudePath: e.target.value })}
							placeholder="/usr/local/bin/claude"
						/>
					</div>
				</div>
				<div className="settings-section">
					<div className="field">
						<label className="field-label" htmlFor="model">
							Model
						</label>
						<select
							id="model"
							value={settings.model}
							onChange={(e) => update({ model: e.target.value })}
						>
							{MODELS.map((m) => (
								<option key={m.value} value={m.value}>
									{m.label}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			<div className="card">
				<p className="card-title">Daily summary</p>
				<div className="settings-section">
					<label className="checkbox-row">
						<input
							type="checkbox"
							checked={settings.dailyEnabled}
							onChange={(e) => update({ dailyEnabled: e.target.checked })}
						/>
						<span className="checkbox-label">Enabled</span>
					</label>
				</div>
				<div className="settings-section">
					<div className="field">
						<label className="field-label" htmlFor="daily-time">
							Time
						</label>
						<input
							id="daily-time"
							type="time"
							value={settings.dailyTime}
							onChange={(e) => update({ dailyTime: e.target.value })}
						/>
					</div>
				</div>
			</div>

			<div className="card">
				<p className="card-title">Weekly synthesis</p>
				<div className="settings-section">
					<label className="checkbox-row">
						<input
							type="checkbox"
							checked={settings.weeklyEnabled}
							onChange={(e) => update({ weeklyEnabled: e.target.checked })}
						/>
						<span className="checkbox-label">Enabled</span>
					</label>
				</div>
				<div className="settings-section">
					<div className="row" style={{ gap: 12 }}>
						<div className="field" style={{ flex: 1, marginBottom: 0 }}>
							<label className="field-label" htmlFor="weekly-day">
								Day
							</label>
							<select
								id="weekly-day"
								value={settings.weeklyDay}
								onChange={(e) => update({ weeklyDay: Number(e.target.value) })}
							>
								{DAYS.map((day, index) => (
									<option key={day} value={index}>
										{day}
									</option>
								))}
							</select>
						</div>
						<div className="field" style={{ flex: 1, marginBottom: 0 }}>
							<label className="field-label" htmlFor="weekly-time">
								Time
							</label>
							<input
								id="weekly-time"
								type="time"
								value={settings.weeklyTime}
								onChange={(e) => update({ weeklyTime: e.target.value })}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="card">
				<p className="card-title">Data</p>
				<div className="field">
					<label className="field-label">Data directory</label>
					<input value={dataDir} readOnly />
				</div>
				<p className="muted" style={{ marginTop: 6 }}>
					Override with the <code>LOCI_DATA_DIR</code> environment variable (default{' '}
					<code>~/.loci</code>).
				</p>
			</div>

			<div className="row row-center" style={{ gap: 12 }}>
				<button className="btn btn-primary" onClick={() => void save()}>
					Save settings
				</button>
				{saved && (
					<span className="saved-msg">✓ Saved — schedule changes apply after restart</span>
				)}
			</div>
		</section>
	);
}
