import { useHashRoute } from './lib/useHashRoute';
import { Sidebar } from './components/Sidebar';

export function App() {
	const route = useHashRoute();

	return (
		<div className="app">
			<Sidebar route={route} />
			<main className="content">
				<section data-testid={`view-${route}`}>
					<h2>{route}</h2>
				</section>
			</main>
		</div>
	);
}
