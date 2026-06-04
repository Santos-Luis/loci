import { renderMarkdown } from '../../../src/renderer/src/lib/markdown';

describe('renderMarkdown', () => {
	it('renders headings and emphasis to HTML', () => {
		expect(renderMarkdown('# Title')).toContain('<h1');
		expect(renderMarkdown('**bold**')).toContain('<strong>');
	});

	it('returns a string synchronously', () => {
		expect(typeof renderMarkdown('plain')).toBe('string');
	});
});
