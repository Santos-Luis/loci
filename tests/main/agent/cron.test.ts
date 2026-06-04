import { dailyCron, weeklyCron } from '../../../src/main/agent/cron';

describe('cron helpers', () => {
	it('builds a daily cron expression from HH:MM', () => {
		expect(dailyCron('08:00')).toBe('0 8 * * *');
		expect(dailyCron('17:30')).toBe('30 17 * * *');
	});

	it('builds a weekly cron expression from day + HH:MM', () => {
		expect(weeklyCron({ day: 5, time: '17:00' })).toBe('0 17 * * 5');
	});

	it('rejects an invalid time', () => {
		expect(() => dailyCron('99:99')).toThrow();
	});
});
