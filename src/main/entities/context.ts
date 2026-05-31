import type { SearchHit } from './search';
import type { Message } from './message';

export type RetrievedContext = {
	hits: SearchHit[];
	recentMessages: Message[];
};
