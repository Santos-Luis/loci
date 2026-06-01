import { sanitizeFtsQuery } from '../../../src/main/managers/retrieval';

describe('sanitizeFtsQuery', () => {
	it('quotes word tokens and ORs them together', () => {
		expect(sanitizeFtsQuery('plants and light')).toBe('"plants" OR "and" OR "light"');
	});

	it('strips punctuation that would break FTS5 syntax', () => {
		expect(sanitizeFtsQuery("What's the plan?")).toBe('"What" OR "s" OR "the" OR "plan"');
	});

	it('returns an empty string when there are no usable tokens', () => {
		expect(sanitizeFtsQuery('   ?!  ')).toBe('');
		expect(sanitizeFtsQuery('')).toBe('');
	});
});
