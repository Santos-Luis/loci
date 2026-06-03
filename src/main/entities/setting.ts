export type Setting = {
	key: string;
	value: string;
};

export type AppSettings = {
	claudePath: string;
	model: string;
	dailyEnabled: boolean;
	dailyTime: string;
	weeklyEnabled: boolean;
	weeklyDay: number;
	weeklyTime: string;
};
