import { parseStreamLine } from '../../../src/main/claude/parse';

describe('parseStreamLine', () => {
	it('extracts a token from a partial content_block_delta event', () => {
		const line = JSON.stringify({
			type: 'stream_event',
			event: { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } },
		});
		expect(parseStreamLine(line)).toEqual({ kind: 'token', text: 'Hello' });
	});

	it('extracts the final text and error flag from a result event', () => {
		const line = JSON.stringify({
			type: 'result',
			subtype: 'success',
			result: 'Full answer',
			is_error: false,
		});
		expect(parseStreamLine(line)).toEqual({
			kind: 'result',
			text: 'Full answer',
			isError: false,
		});
	});

	it('classifies unrelated events as other', () => {
		const line = JSON.stringify({ type: 'system', subtype: 'init' });
		expect(parseStreamLine(line)).toEqual({ kind: 'other' });
	});

	it('treats unparseable lines as other', () => {
		expect(parseStreamLine('not json')).toEqual({ kind: 'other' });
		expect(parseStreamLine('')).toEqual({ kind: 'other' });
	});
});
