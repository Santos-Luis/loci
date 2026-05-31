import { SearchHit } from './search';
import { Message } from './message';

export type RetrievedContext = {
	hits: SearchHit[];
	recentMessages: Message[];
};
