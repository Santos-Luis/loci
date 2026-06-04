import { useHashRoute } from './lib/useHashRoute';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { Ask } from './views/Ask';
import { Topics } from './views/Topics';
import { Notes } from './views/Notes';
import { Insights } from './views/Insights';
import { Settings } from './views/Settings';

export function App() {
	const route = useHashRoute();

	return (
		<div className="app">
			<Sidebar route={route} />
			<main className="content">
				{route === 'dashboard' && <Dashboard />}
				{route === 'ask' && <Ask />}
				{route === 'topics' && <Topics />}
				{route === 'notes' && <Notes />}
				{route === 'insights' && <Insights />}
				{route === 'settings' && <Settings />}
			</main>
		</div>
	);
}
