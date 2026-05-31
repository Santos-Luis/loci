import { homedir } from 'os'
import { join } from 'path'
import { mkdirSync } from 'fs'

export function getDataDir(env: NodeJS.ProcessEnv): string {
	return env.LOCI_DATA_DIR ?? join(homedir(), '.loci')
}

export function getDbPath(dataDir: string): string {
	return join(dataDir, 'loci.sqlite')
}

export function ensureDataDir(dataDir: string): void {
	mkdirSync(dataDir, { recursive: true })
}
