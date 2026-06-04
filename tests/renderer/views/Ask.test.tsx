import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Ask } from '../../../src/renderer/src/views/Ask';

beforeEach(() => {
	(window as unknown as { loci: unknown }).loci = {
		topics: { list: () => Promise.resolve([]) },
		ask: {
			onToken: () => () => {},
			send: () =>
				Promise.resolve({
					conversationId: 1,
					message: {
						id: 2,
						conversationId: 1,
						role: 'assistant',
						content: '**Hi there**',
						createdAt: 'now',
					},
					context: {
						hits: [
							{
								source: 'note',
								id: 1,
								topicId: null,
								title: 'Bees',
								content: 'buzz',
								score: -1,
							},
						],
						recentMessages: [],
					},
				}),
		},
	};
	sessionStorage.clear();
});

describe('Ask', () => {
	it('sends a message and renders the user text and rendered assistant reply', async () => {
		render(<Ask />);
		fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
			target: { value: 'Tell me about bees' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Send' }));

		expect(screen.getByText('Tell me about bees')).toBeInTheDocument();
		await waitFor(() => expect(screen.getByText('Hi there')).toBeInTheDocument());
	});

	it('toggles the context panel after a reply', async () => {
		render(<Ask />);
		fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
			target: { value: 'q' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Send' }));

		const toggle = await screen.findByRole('button', { name: /context/i });
		fireEvent.click(toggle);
		expect(screen.getByTestId('context-panel')).toBeInTheDocument();
	});
});
