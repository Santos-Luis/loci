import { Knex } from 'knex';
import { SearchHit } from './search';
import { Message } from './message';

export type Context = {
	db: Knex;
};

export type RetrievedContext = {
	hits: SearchHit[];
	recentMessages: Message[];
};
