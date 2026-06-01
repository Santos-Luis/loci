export function sanitizeFtsQuery(input: string): string {
	const tokens = input.match(/[A-Za-z0-9]+/g);
	if (!tokens || tokens.length === 0) {
		return '';
	}

	return tokens.map((token) => `"${token}"`).join(' OR ');
}
