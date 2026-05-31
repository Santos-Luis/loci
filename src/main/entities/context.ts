import type { SearchHit } from './search';
import type { Message } from './message';

export interface RetrievedContext {
	hits: SearchHit[];
	recentMessages: Message[];
}
