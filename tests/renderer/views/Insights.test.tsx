import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Insights } from '../../../src/renderer/src/views/Insights';

const list = vi.fn().mockResolvedValue([
	{
		id: 1,
		type: 'summary',
		content: 'Summary text',
		topicId: null,
		generatedAt: 'now',
		readAt: null,
	},
]);
const markAllRead = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
	list.mockClear();
	markAllRead.mockClear();
	(window as unknown as { loci: unknown }).loci = {
		insights: { list, markAllRead },
		topics: {
			list: () =>
				Promise.resolve([{ id: 1, name: 'Space', description: null, createdAt: 'now' }]),
		},
	};
});

describe('Insights', () => {
	it('marks all read on mount and renders insights', async () => {
		render(<Insights />);
		await waitFor(() => expect(screen.getByText('Summary text')).toBeInTheDocument());
		expect(markAllRead).toHaveBeenCalled();
	});

	it('filters by type', async () => {
		render(<Insights />);
		await waitFor(() => expect(screen.getByText('Summary text')).toBeInTheDocument());
		fireEvent.click(screen.getByRole('button', { name: 'Question' }));
		await waitFor(() => expect(list).toHaveBeenCalledWith({ type: 'question' }));
	});

	it('filters by topic', async () => {
		render(<Insights />);
		await waitFor(() => expect(screen.getByText('Summary text')).toBeInTheDocument());
		const topicSelect = await screen.findByDisplayValue('All topics');
		fireEvent.change(topicSelect, { target: { value: '1' } });
		await waitFor(() => expect(list).toHaveBeenCalledWith({ topicId: 1 }));
	});

	it('signals the sidebar to refresh after marking read', async () => {
		const onReread = vi.fn();
		window.addEventListener('loci:insights-read', onReread);
		render(<Insights />);
		await waitFor(() => expect(onReread).toHaveBeenCalled());
		window.removeEventListener('loci:insights-read', onReread);
	});
});
