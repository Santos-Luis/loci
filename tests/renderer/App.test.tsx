import { render, screen, waitFor } from '@testing-library/react';
import { App } from '../../src/renderer/src/App';

beforeEach(() => {
	(window as unknown as { loci: unknown }).loci = {
		insights: { unreadCount: () => Promise.resolve(0), onUpdated: () => () => {} },
		dashboard: {
			get: () =>
				Promise.resolve({ latestInsight: null, recentConversations: [], lastNote: null }),
		},
	};
	window.location.hash = '#/dashboard';
});

describe('App shell', () => {
	it('renders the sidebar and the dashboard view on the default route', async () => {
		render(<App />);
		expect(screen.getByText('Loci')).toBeInTheDocument();
		await waitFor(() => expect(screen.getByTestId('view-dashboard')).toBeInTheDocument());
		expect(screen.getByText('Quick ask')).toBeInTheDocument();
	});
});
