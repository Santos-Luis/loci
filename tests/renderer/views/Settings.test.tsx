import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Settings } from '../../../src/renderer/src/views/Settings';

const update = vi.fn().mockImplementation((patch) => Promise.resolve(patch));

const baseSettings = {
	claudePath: 'claude',
	model: 'claude-sonnet-4-6',
	dailyEnabled: true,
	dailyTime: '08:00',
	weeklyEnabled: true,
	weeklyDay: 5,
	weeklyTime: '17:00',
};

beforeEach(() => {
	update.mockClear();
	(window as unknown as { loci: unknown }).loci = {
		settings: {
			get: () => Promise.resolve(baseSettings),
			update,
			dataDir: () => Promise.resolve('/home/me/.loci'),
		},
	};
});

describe('Settings', () => {
	it('loads current settings and saves an edited model', async () => {
		render(<Settings />);
		const modelSelect = await screen.findByLabelText(/Model/);
		fireEvent.change(modelSelect, { target: { value: 'claude-haiku-4-5-20251001' } });
		fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));

		await waitFor(() =>
			expect(update).toHaveBeenCalledWith(
				expect.objectContaining({ model: 'claude-haiku-4-5-20251001' }),
			),
		);
	});

	it('shows the data directory as a read-only field', async () => {
		render(<Settings />);
		const field = await screen.findByDisplayValue('/home/me/.loci');
		expect(field).toHaveAttribute('readonly');
	});
});
