import { renderHook, act } from '@testing-library/react';
import { parseHash, useHashRoute } from '../../../src/renderer/src/lib/useHashRoute';

describe('parseHash', () => {
	it('maps known routes and falls back to dashboard', () => {
		expect(parseHash('#/ask')).toBe('ask');
		expect(parseHash('#/notes')).toBe('notes');
		expect(parseHash('#/bogus')).toBe('dashboard');
		expect(parseHash('')).toBe('dashboard');
	});
});

describe('useHashRoute', () => {
	it('reflects the current hash and reacts to hashchange', () => {
		window.location.hash = '#/insights';
		const { result } = renderHook(() => useHashRoute());
		expect(result.current).toBe('insights');

		act(() => {
			window.location.hash = '#/topics';
			window.dispatchEvent(new HashChangeEvent('hashchange'));
		});
		expect(result.current).toBe('topics');
	});
});
