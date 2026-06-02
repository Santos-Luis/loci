import { EventEmitter } from 'events';
import { runClaude, streamClaude } from '../../../src/main/claude/client';

// Minimal fake of the child_process.spawn return shape we use.
function makeFakeChild(lines: string[], { exitCode = 0 } = {}) {
	const child = new EventEmitter() as EventEmitter & {
		stdout: EventEmitter;
		stderr: EventEmitter;
	};
	child.stdout = new EventEmitter();
	child.stderr = new EventEmitter();

	queueMicrotask(() => {
		for (const line of lines) {
			child.stdout.emit('data', Buffer.from(line + '\n'));
		}

		child.emit('close', exitCode);
	});

	return child;
}

describe('runClaude', () => {
	it('parses the result field from --output-format json', async () => {
		const captured: { cmd?: string; args?: string[] } = {};
		const fakeSpawn = (cmd: string, args: string[]) => {
			captured.cmd = cmd;
			captured.args = args;

			return makeFakeChild([
				JSON.stringify({
					type: 'result',
					subtype: 'success',
					result: 'answer',
					is_error: false,
				}),
			]);
		};

		const text = await runClaude({
			claudePath: 'claude',
			model: 'claude-sonnet-4-6',
			prompt: 'hi',
			spawn: fakeSpawn as never,
		});

		expect(text).toBe('answer');
		expect(captured.cmd).toBe('claude');
		expect(captured.args).toContain('--output-format');
		expect(captured.args).toContain('json');
		expect(captured.args).toContain('--model');
		expect(captured.args).toContain('claude-sonnet-4-6');
		expect(captured.args).toContain('hi');
	});
});

describe('streamClaude', () => {
	it('emits tokens and resolves with the final result text', async () => {
		const tokens: string[] = [];
		const fakeSpawn = () =>
			makeFakeChild([
				JSON.stringify({
					type: 'stream_event',
					event: {
						type: 'content_block_delta',
						delta: { type: 'text_delta', text: 'Hel' },
					},
				}),
				JSON.stringify({
					type: 'stream_event',
					event: {
						type: 'content_block_delta',
						delta: { type: 'text_delta', text: 'lo' },
					},
				}),
				JSON.stringify({
					type: 'result',
					subtype: 'success',
					result: 'Hello',
					is_error: false,
				}),
			]);

		const text = await streamClaude({
			claudePath: 'claude',
			model: 'claude-sonnet-4-6',
			prompt: 'hi',
			onToken: (t) => tokens.push(t),
			spawn: fakeSpawn as never,
		});

		expect(tokens).toEqual(['Hel', 'lo']);
		expect(text).toBe('Hello');
	});

	it('rejects when the process exits non-zero', async () => {
		const fakeSpawn = () => makeFakeChild([], { exitCode: 1 });

		await expect(
			streamClaude({
				claudePath: 'claude',
				model: 'claude-sonnet-4-6',
				prompt: 'hi',
				onToken: () => {},
				spawn: fakeSpawn as never,
			}),
		).rejects.toThrow();
	});
});
