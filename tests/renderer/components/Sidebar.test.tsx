import { render, screen, waitFor } from '@testing-library/react';
import { Sidebar } from '../../../src/renderer/src/components/Sidebar';

function mockLoci(unread: number) {
	(window as unknown as { loci: unknown }).loci = {
		insights: {
			unreadCount: () => Promise.resolve(unread),
			onUpdated: () => () => {},
		},
	};
}

describe('Sidebar', () => {
	it('renders all six nav links and the unread insights badge', async () => {
		mockLoci(3);
		render(<Sidebar route="dashboard" />);

		for (const label of ['Dashboard', 'Ask', 'Topics', 'Notes', 'Insights', 'Settings']) {
			expect(screen.getByRole('link', { name: new RegExp(label) })).toBeInTheDocument();
		}

		await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
	});

	it('hides the badge when there are no unread insights', async () => {
		mockLoci(0);
		render(<Sidebar route="ask" />);

		await waitFor(() => expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument());
	});

	it('re-polls and clears the badge when insights are read', async () => {
		let count = 2;
		(window as unknown as { loci: unknown }).loci = {
			insights: {
				unreadCount: () => Promise.resolve(count),
				onUpdated: () => () => {},
			},
		};
		render(<Sidebar route="dashboard" />);
		await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());

		count = 0;
		window.dispatchEvent(new Event('loci:insights-read'));
		await waitFor(() => expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument());
	});
});
