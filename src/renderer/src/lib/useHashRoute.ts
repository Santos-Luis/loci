import { useEffect, useState } from 'react';

export type Route = 'dashboard' | 'ask' | 'topics' | 'notes' | 'insights' | 'settings';

const ROUTES: Route[] = ['dashboard', 'ask', 'topics', 'notes', 'insights', 'settings'];

export function parseHash(hash: string): Route {
	const value = hash.replace(/^#\/?/, '');

	return (ROUTES as string[]).includes(value) ? (value as Route) : 'dashboard';
}

export function useHashRoute(): Route {
	const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

	useEffect(() => {
		const onChange = (): void => setRoute(parseHash(window.location.hash));
		window.addEventListener('hashchange', onChange);

		return () => window.removeEventListener('hashchange', onChange);
	}, []);

	return route;
}
