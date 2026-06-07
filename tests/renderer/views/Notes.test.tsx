import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Notes } from '../../../src/renderer/src/views/Notes';

const create = vi.fn().mockResolvedValue({
	id: 1,
	topicId: null,
	title: 'T',
	content: 'C',
	createdAt: 'now',
	updatedAt: 'now',
});

beforeEach(() => {
	create.mockClear();
	(window as unknown as { loci: unknown }).loci = {
		notes: {
			list: () => Promise.resolve([]),
			create,
			update: vi.fn(),
			delete: vi.fn(),
			search: () =>
				Promise.resolve([
					{
						source: 'note',
						id: 5,
						topicId: null,
						title: 'Photosynthesis',
						content: 'plants and light',
						score: -1,
					},
				]),
		},
		topics: { list: () => Promise.resolve([]) },
	};
});

describe('Notes', () => {
	it('creates a new note from the editor', async () => {
		render(<Notes />);
		fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'My note' } });
		fireEvent.change(screen.getByPlaceholderText('Write in markdown…'), {
			target: { value: 'body text' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Create' }));

		await waitFor(() =>
			expect(create).toHaveBeenCalledWith({
				topicId: null,
				title: 'My note',
				content: 'body text',
			}),
		);
	});

	it('renders a markdown preview', () => {
		render(<Notes />);
		fireEvent.change(screen.getByPlaceholderText('Write in markdown…'), {
			target: { value: '# Heading' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
		expect(screen.getByTestId('note-preview').innerHTML).toContain('<h1');
	});

	it('searches notes and loads a result into the editor', async () => {
		render(<Notes />);
		fireEvent.change(screen.getByPlaceholderText('Search…'), {
			target: { value: 'plants' },
		});
		fireEvent.click(await screen.findByRole('button', { name: /Photosynthesis/ }));
		expect(screen.getByPlaceholderText('Title')).toHaveValue('Photosynthesis');
	});
});
