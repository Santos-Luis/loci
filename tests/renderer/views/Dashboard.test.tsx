import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Dashboard } from '../../../src/renderer/src/views/Dashboard';

beforeEach(() => {
	(window as unknown as { loci: unknown }).loci = {
		dashboard: {
			get: () =>
				Promise.resolve({
					latestInsight: {
						id: 1,
						type: 'summary',
						content: 'Insight!',
						topicId: null,
						generatedAt: 'now',
						readAt: null,
					},
					recentConversations: [
						{ id: 1, topicId: null, title: 'Chat', createdAt: 'now' },
					],
					lastNote: {
						id: 1,
						topicId: null,
						title: 'My note',
						content: 'c',
						createdAt: 'now',
						updatedAt: 'now',
					},
				}),
		},
	};
	window.location.hash = '#/dashboard';
	sessionStorage.clear();
});

describe('Dashboard', () => {
	it('renders the latest insight, recent conversations, and last note', async () => {
		render(<Dashboard />);
		await waitFor(() => expect(screen.getByText('Insight!')).toBeInTheDocument());
		expect(screen.getByText('Chat')).toBeInTheDocument();
		expect(screen.getByText('My note')).toBeInTheDocument();
	});

	it('stores a quick-ask draft and navigates to Ask', async () => {
		render(<Dashboard />);
		fireEvent.change(screen.getByPlaceholderText('Ask something...'), {
			target: { value: 'What is gravity?' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Ask' }));

		expect(sessionStorage.getItem('loci.quickAsk')).toBe('What is gravity?');
		expect(window.location.hash).toBe('#/ask');
	});
});
