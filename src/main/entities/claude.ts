export type ParsedLine =
	| { kind: 'token'; text: string }
	| { kind: 'result'; text: string; isError: boolean }
	| { kind: 'other' };
