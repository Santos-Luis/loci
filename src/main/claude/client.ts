import { spawn as nodeSpawn } from 'child_process';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { parseStreamLine } from './parse';

type SpawnFn = (command: string, args: string[]) => ChildProcessWithoutNullStreams;

function collectLines(onLine: (line: string) => void) {
	let buffer = '';

	return (chunk: Buffer): void => {
		buffer += chunk.toString();
		let newlineIndex = buffer.indexOf('\n');
		while (newlineIndex !== -1) {
			onLine(buffer.slice(0, newlineIndex));
			buffer = buffer.slice(newlineIndex + 1);
			newlineIndex = buffer.indexOf('\n');
		}
	};
}

export async function runClaude({
	claudePath,
	model,
	prompt,
	spawn = nodeSpawn as SpawnFn,
}: {
	claudePath: string;
	model: string;
	prompt: string;
	spawn?: SpawnFn;
}): Promise<string> {
	const child = spawn(claudePath, ['-p', prompt, '--output-format', 'json', '--model', model]);

	return new Promise<string>((resolve, reject) => {
		let stdout = '';
		let stderr = '';

		child.stdout.on('data', (chunk: Buffer) => {
			stdout += chunk.toString();
		});
		child.stderr.on('data', (chunk: Buffer) => {
			stderr += chunk.toString();
		});
		child.on('error', reject);
		child.on('close', (code: number) => {
			if (code !== 0) {
				reject(new Error(`claude exited with code ${code}: ${stderr}`));

				return;
			}

			try {
				const parsed = JSON.parse(stdout) as { result?: string; is_error?: boolean };
				if (parsed.is_error || typeof parsed.result !== 'string') {
					reject(new Error(`claude returned an error: ${stdout}`));

					return;
				}

				resolve(parsed.result);
			} catch (err) {
				reject(new Error(`failed to parse claude output: ${String(err)}`));
			}
		});
	});
}

export async function streamClaude({
	claudePath,
	model,
	prompt,
	onToken,
	spawn = nodeSpawn as SpawnFn,
}: {
	claudePath: string;
	model: string;
	prompt: string;
	onToken: (token: string) => void;
	spawn?: SpawnFn;
}): Promise<string> {
	const child = spawn(claudePath, [
		'-p',
		prompt,
		'--output-format',
		'stream-json',
		'--include-partial-messages',
		'--verbose',
		'--model',
		model,
	]);

	return new Promise<string>((resolve, reject) => {
		let accumulated = '';
		let resultText: string | null = null;
		let stderr = '';

		const onLine = (line: string): void => {
			const parsed = parseStreamLine(line);
			if (parsed.kind === 'token') {
				accumulated += parsed.text;
				onToken(parsed.text);
			} else if (parsed.kind === 'result') {
				if (parsed.isError) {
					reject(new Error(`claude returned an error: ${parsed.text}`));

					return;
				}

				resultText = parsed.text;
			}
		};

		child.stdout.on('data', collectLines(onLine));
		child.stderr.on('data', (chunk: Buffer) => {
			stderr += chunk.toString();
		});
		child.on('error', reject);
		child.on('close', (code: number) => {
			if (code !== 0) {
				reject(new Error(`claude exited with code ${code}: ${stderr}`));

				return;
			}

			resolve(resultText ?? accumulated);
		});
	});
}
