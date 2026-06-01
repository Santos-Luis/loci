export type ParsedLine =
	| { kind: 'token'; text: string }
	| { kind: 'result'; text: string; isError: boolean }
	| { kind: 'other' };

export function parseStreamLine(line: string): ParsedLine {
	const trimmed = line.trim();
	if (!trimmed) {
		return { kind: 'other' };
	}

	let event: unknown;
	try {
		event = JSON.parse(trimmed);
	} catch {
		return { kind: 'other' };
	}

	const obj = event as {
		type?: string;
		result?: string;
		is_error?: boolean;
		event?: { type?: string; delta?: { type?: string; text?: string } };
	};

	if (
		obj.type === 'stream_event' &&
		obj.event?.type === 'content_block_delta' &&
		obj.event.delta?.type === 'text_delta' &&
		typeof obj.event.delta.text === 'string'
	) {
		return { kind: 'token', text: obj.event.delta.text };
	}

	if (obj.type === 'result' && typeof obj.result === 'string') {
		return { kind: 'result', text: obj.result, isError: Boolean(obj.is_error) };
	}

	return { kind: 'other' };
}
