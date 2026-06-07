import { useEffect, useState } from 'react';
import { Route } from '../lib/useHashRoute';
import { loci } from '../lib/api';
import { Icon } from './Icon';

type NavItem = { route: Route; label: string; icon: Parameters<typeof Icon>[0]['name'] };

const MAIN_LINKS: NavItem[] = [
	{ route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
	{ route: 'ask', label: 'Ask', icon: 'ask' },
	{ route: 'topics', label: 'Topics', icon: 'topics' },
	{ route: 'notes', label: 'Notes', icon: 'notes' },
	{ route: 'insights', label: 'Insights', icon: 'insights' },
];

export function Sidebar({ route }: { route: Route }) {
	const [unread, setUnread] = useState(0);

	useEffect(() => {
		const refresh = (): void => {
			void loci().insights.unreadCount().then(setUnread);
		};

		refresh();
		const cleanup = loci().insights.onUpdated(refresh);
		window.addEventListener('loci:insights-read', refresh);

		return () => {
			cleanup();
			window.removeEventListener('loci:insights-read', refresh);
		};
	}, []);

	return (
		<nav className="sidebar">
			<div className="sidebar-header">
				<p className="sidebar-title">Loci</p>
				<p className="sidebar-tagline">Your second memory</p>
			</div>

			<div className="sidebar-nav">
				<ul>
					{MAIN_LINKS.map((link) => (
						<li key={link.route}>
							<a
								href={`#/${link.route}`}
								className={route === link.route ? 'nav-link active' : 'nav-link'}
							>
								<Icon name={link.icon} />
								<span className="nav-link-label">{link.label}</span>
								{link.route === 'insights' && unread > 0 && (
									<span className="badge" data-testid="unread-badge">
										{unread}
									</span>
								)}
							</a>
						</li>
					))}
				</ul>
			</div>

			<div className="sidebar-bottom">
				<a
					href="#/settings"
					className={route === 'settings' ? 'nav-link active' : 'nav-link'}
				>
					<Icon name="settings" />
					<span className="nav-link-label">Settings</span>
				</a>
			</div>
		</nav>
	);
}
