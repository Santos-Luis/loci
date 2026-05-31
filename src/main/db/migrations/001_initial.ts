import { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
	await db.schema.createTable('topics', (t) => {
		t.increments('id').primary();
		t.text('name').notNullable();
		t.text('description');
		t.text('created_at').notNullable().defaultTo(db.fn.now());
	});

	await db.schema.createTable('notes', (t) => {
		t.increments('id').primary();
		t.integer('topic_id').references('id').inTable('topics').onDelete('SET NULL');
		t.text('title').notNullable().defaultTo('');
		t.text('content').notNullable().defaultTo('');
		t.text('created_at').notNullable().defaultTo(db.fn.now());
		t.text('updated_at').notNullable().defaultTo(db.fn.now());
	});

	await db.schema.createTable('conversations', (t) => {
		t.increments('id').primary();
		t.integer('topic_id').references('id').inTable('topics').onDelete('SET NULL');
		t.text('title').notNullable().defaultTo('');
		t.text('created_at').notNullable().defaultTo(db.fn.now());
	});

	await db.schema.createTable('messages', (t) => {
		t.increments('id').primary();
		t.integer('conversation_id')
			.notNullable()
			.references('id')
			.inTable('conversations')
			.onDelete('CASCADE');
		t.text('role').notNullable().checkIn(['user', 'assistant']);
		t.text('content').notNullable();
		t.text('created_at').notNullable().defaultTo(db.fn.now());
	});

	await db.schema.createTable('insights', (t) => {
		t.increments('id').primary();
		t.integer('topic_id').references('id').inTable('topics').onDelete('SET NULL');
		t.text('type').notNullable().checkIn(['summary', 'connection', 'question']);
		t.text('content').notNullable();
		t.text('generated_at').notNullable().defaultTo(db.fn.now());
		t.text('read_at');
	});

	await db.schema.createTable('settings', (t) => {
		t.text('key').primary();
		t.text('value').notNullable();
	});

	await db.raw(
		"CREATE VIRTUAL TABLE notes_fts USING fts5(title, content, content='notes', content_rowid='id')",
	);
	await db.raw(`CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
		INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
	END`);
	await db.raw(`CREATE TRIGGER notes_ad AFTER DELETE ON notes BEGIN
		INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES ('delete', old.id, old.title, old.content);
	END`);
	await db.raw(`CREATE TRIGGER notes_au AFTER UPDATE ON notes BEGIN
		INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES ('delete', old.id, old.title, old.content);
		INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
	END`);

	await db.raw(
		"CREATE VIRTUAL TABLE messages_fts USING fts5(content, content='messages', content_rowid='id')",
	);
	await db.raw(`CREATE TRIGGER messages_ai AFTER INSERT ON messages BEGIN
		INSERT INTO messages_fts(rowid, content) VALUES (new.id, new.content);
	END`);
	await db.raw(`CREATE TRIGGER messages_ad AFTER DELETE ON messages BEGIN
		INSERT INTO messages_fts(messages_fts, rowid, content) VALUES ('delete', old.id, old.content);
	END`);
	await db.raw(`CREATE TRIGGER messages_au AFTER UPDATE ON messages BEGIN
		INSERT INTO messages_fts(messages_fts, rowid, content) VALUES ('delete', old.id, old.content);
		INSERT INTO messages_fts(rowid, content) VALUES (new.id, new.content);
	END`);

	await db.raw(
		"CREATE VIRTUAL TABLE insights_fts USING fts5(content, content='insights', content_rowid='id')",
	);
	await db.raw(`CREATE TRIGGER insights_ai AFTER INSERT ON insights BEGIN
		INSERT INTO insights_fts(rowid, content) VALUES (new.id, new.content);
	END`);
	await db.raw(`CREATE TRIGGER insights_ad AFTER DELETE ON insights BEGIN
		INSERT INTO insights_fts(insights_fts, rowid, content) VALUES ('delete', old.id, old.content);
	END`);
	await db.raw(`CREATE TRIGGER insights_au AFTER UPDATE ON insights BEGIN
		INSERT INTO insights_fts(insights_fts, rowid, content) VALUES ('delete', old.id, old.content);
		INSERT INTO insights_fts(rowid, content) VALUES (new.id, new.content);
	END`);

	await db('settings').insert([
		{ key: 'claude_path', value: 'claude' },
		{ key: 'model', value: 'claude-sonnet-4-6' },
		{ key: 'daily_enabled', value: '1' },
		{ key: 'daily_time', value: '08:00' },
		{ key: 'weekly_enabled', value: '1' },
		{ key: 'weekly_day', value: '5' },
		{ key: 'weekly_time', value: '17:00' },
	]);
}

export async function down(db: Knex): Promise<void> {
	for (const trigger of [
		'notes_ai',
		'notes_ad',
		'notes_au',
		'messages_ai',
		'messages_ad',
		'messages_au',
		'insights_ai',
		'insights_ad',
		'insights_au',
	]) {
		await db.raw(`DROP TRIGGER IF EXISTS ${trigger}`);
	}

	await db.schema.dropTableIfExists('notes_fts');
	await db.schema.dropTableIfExists('messages_fts');
	await db.schema.dropTableIfExists('insights_fts');

	await db.schema.dropTableIfExists('settings');
	await db.schema.dropTableIfExists('insights');
	await db.schema.dropTableIfExists('messages');
	await db.schema.dropTableIfExists('conversations');
	await db.schema.dropTableIfExists('notes');
	await db.schema.dropTableIfExists('topics');
}
