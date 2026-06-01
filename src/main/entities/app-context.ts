import { Knex } from 'knex';

export type AppContext = {
	db: Knex;
};
