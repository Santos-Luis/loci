import { join } from 'path';
import { homedir } from 'os';
import { getDataDir, getDbPath } from '../../src/main/config';

describe('config', () => {
	it('defaults the data dir to ~/.loci', () => {
		expect(getDataDir({})).toBe(join(homedir(), '.loci'));
	});

	it('honours LOCI_DATA_DIR override', () => {
		expect(getDataDir({ LOCI_DATA_DIR: '/tmp/loci-test' })).toBe('/tmp/loci-test');
	});

	it('builds the db path inside the data dir', () => {
		expect(getDbPath('/tmp/loci-test')).toBe(join('/tmp/loci-test', 'loci.sqlite'));
	});
});
