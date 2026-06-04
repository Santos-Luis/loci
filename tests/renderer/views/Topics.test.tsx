import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Topics } from '../../../src/renderer/src/views/Topics';

const create = vi
	.fn()
	.mockResolvedValue({ id: 2, name: 'New', description: null, createdAt: 'now' });

beforeEach(() => {
	create.mockClear();
	(window as unknown as { loci: unknown }).loci = {
		topics: {
			list: () =>
				Promise.resolve([{ id: 1, name: 'Space', description: null, createdAt: 'now' }]),
			create,
			get: () =>
				Promise.resolve({
					topic: { id: 1, name: 'Space', description: null, createdAt: 'now' },
					notes: [
						{
							id: 1,
							topicId: 1,
							title: 'n',
							content: 'c',
							createdAt: 'now',
							updatedAt: 'now',
						},
					],
					conversations: [],
					insights: [],
				}),
		},
	};
});

describe('Topics', () => {
	it('lists topics and opens a detail with counts', async () => {
		render(<Topics />);
		const link = await screen.findByRole('button', { name: 'Space' });
		fireEvent.click(link);
		await waitFor(() => expect(screen.getByTestId('topic-detail')).toBeInTheDocument());
		expect(screen.getByText(/Notes: 1/)).toBeInTheDocument();
		expect(screen.getByText('n')).toBeInTheDocument();
	});

	it('creates a topic from the form', async () => {
		render(<Topics />);
		fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Biology' } });
		fireEvent.click(screen.getByRole('button', { name: 'Create' }));
		await waitFor(() =>
			expect(create).toHaveBeenCalledWith({ name: 'Biology', description: null }),
		);
	});
});
