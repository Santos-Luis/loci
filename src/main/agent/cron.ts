const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function dailyCron(time: string): string {
	const { hour, minute } = parseTime(time);

	return `${minute} ${hour} * * *`;
}

export function weeklyCron({ day, time }: { day: number; time: string }): string {
	if (day < 0 || day > 6) {
		throw new Error(`invalid day: ${day}`);
	}

	const { hour, minute } = parseTime(time);

	return `${minute} ${hour} * * ${day}`;
}

function parseTime(time: string): { hour: number; minute: number } {
	if (!TIME_PATTERN.test(time)) {
		throw new Error(`invalid time: ${time}`);
	}

	const [hour, minute] = time.split(':').map(Number);

	return { hour, minute };
}
