import { useEffect, useState } from 'react';
import { Route } from '../lib/useHashRoute';
import { loci } from '../lib/api';

const LINKS: { route: Route; label: string }[] = [
	{ route: 'dashboard', label: 'Dashboard' },
	{ route: 'ask', label: 'Ask' },
	{ route: 'topics', label: 'Topics' },
	{ route: 'notes', label: 'Notes' },
	{ route: 'insights', label: 'Insights' },
	{ route: 'settings', label: 'Settings' },
];

export function Sidebar({ route }: { route: Route }) {
	const [unread, setUnread] = useState(0);

	useEffect(() => {
		const refresh = (): void => {
			void loci().insights.unreadCount().then(setUnread);
		};

		refresh();
		const cleanup = loci().insights.onUpdated(refresh);
		// The Insights view dispatches this after marking everything read, so the
		// badge clears immediately instead of waiting for the next agent run.
		window.addEventListener('loci:insights-read', refresh);

		return () => {
			cleanup();
			window.removeEventListener('loci:insights-read', refresh);
		};
	}, []);

	return (
		<nav className="sidebar">
			<h1 className="sidebar-title">Loci</h1>
			<ul>
				{LINKS.map((link) => (
					<li key={link.route}>
						<a
							href={`#/${link.route}`}
							className={route === link.route ? 'nav-link active' : 'nav-link'}
						>
							{link.label}
							{link.route === 'insights' && unread > 0 && (
								<span className="badge" data-testid="unread-badge">
									{unread}
								</span>
							)}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
