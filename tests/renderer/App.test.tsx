import { render, screen } from '@testing-library/react';
import { App } from '../../src/renderer/src/App';

beforeEach(() => {
	(window as unknown as { loci: unknown }).loci = {
		insights: { unreadCount: () => Promise.resolve(0), onUpdated: () => () => {} },
	};
	window.location.hash = '#/dashboard';
});

describe('App shell', () => {
	it('renders the sidebar and the routed section', () => {
		render(<App />);
		expect(screen.getByText('Loci')).toBeInTheDocument();
		expect(screen.getByTestId('view-dashboard')).toBeInTheDocument();
	});
});
