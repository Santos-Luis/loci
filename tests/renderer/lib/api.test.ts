import { loci } from '../../../src/renderer/src/lib/api';

describe('loci accessor', () => {
	it('returns the window.loci bridge', () => {
		const fake = { topics: { list: () => Promise.resolve([]) } };
		(window as unknown as { loci: unknown }).loci = fake;

		expect(loci()).toBe(fake);
	});
});
