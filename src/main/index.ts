import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import { join } from 'path';
import cron from 'node-cron';
import { getDataDir, getDbPath, ensureDataDir } from './config';
import { createDb, applyPragmas } from './db/knex';
import { runMigrations } from './db/migrate';
import { registerIpcHandlers } from './ipc';
import { runClaude, streamClaude } from './claude/client';
import { getSettings } from './managers/settings';
import { startAgent } from './agent/scheduler';

let mainWindow: BrowserWindow | null = null;

function createWindow(): BrowserWindow {
	const window = new BrowserWindow({
		width: 1100,
		height: 760,
		show: false,
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			contextIsolation: true,
			sandbox: false,
		},
	});

	window.on('ready-to-show', () => {
		window.show();
	});

	if (process.env.ELECTRON_RENDERER_URL) {
		void window.loadURL(process.env.ELECTRON_RENDERER_URL);
	} else {
		void window.loadFile(join(__dirname, '../renderer/index.html'));
	}

	return window;
}

async function bootstrap(): Promise<void> {
	const dataDir = getDataDir(process.env);
	ensureDataDir(dataDir);

	const db = createDb(getDbPath(dataDir));
	await applyPragmas(db);
	await runMigrations(db);
	const ctx = { db };

	registerIpcHandlers({
		ipcMain,
		ctx,
		dataDir,
		getMainWindow: () => mainWindow,
		stream: streamClaude,
	});

	mainWindow = createWindow();

	const run = async (prompt: string): Promise<string> => {
		const settings = await getSettings(ctx);

		return runClaude({ claudePath: settings.claudePath, model: settings.model, prompt });
	};

	await startAgent({
		ctx,
		run,
		notify: ({ title, body }) => {
			new Notification({ title, body }).show();
		},
		onUpdated: () => {
			mainWindow?.webContents.send('insights:updated');
		},
		schedule: (expression, task) => cron.schedule(expression, task),
	});

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			mainWindow = createWindow();
		}
	});
}

app.whenReady().then(bootstrap);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
