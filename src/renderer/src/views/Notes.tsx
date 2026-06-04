import { useEffect, useState } from 'react';
import { Note, SearchHit, Topic } from '../lib/types';
import { loci } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';

type Editing = {
	id: number | null;
	topicId: number | null;
	title: string;
	content: string;
};

const NEW_NOTE: Editing = { id: null, topicId: null, title: '', content: '' };

export function Notes() {
	const [notes, setNotes] = useState<Note[]>([]);
	const [topics, setTopics] = useState<Topic[]>([]);
	const [editing, setEditing] = useState<Editing>(NEW_NOTE);
	const [preview, setPreview] = useState(false);
	const [search, setSearch] = useState('');
	const [results, setResults] = useState<SearchHit[]>([]);

	const refresh = (): void => {
		void loci().notes.list().then(setNotes);
	};

	useEffect(() => {
		refresh();
		void loci().topics.list().then(setTopics);
	}, []);

	const runSearch = (query: string): void => {
		setSearch(query);
		if (!query.trim()) {
			setResults([]);

			return;
		}

		void loci().notes.search(query).then(setResults);
	};

	const open = (note: {
		id: number;
		topicId: number | null;
		title: string;
		content: string;
	}): void => {
		setEditing({
			id: note.id,
			topicId: note.topicId,
			title: note.title,
			content: note.content,
		});
		setPreview(false);
	};

	const save = async (): Promise<void> => {
		if (editing.id === null) {
			await loci().notes.create({
				topicId: editing.topicId,
				title: editing.title,
				content: editing.content,
			});
		} else {
			await loci().notes.update({
				id: editing.id,
				topicId: editing.topicId,
				title: editing.title,
				content: editing.content,
			});
		}

		setEditing(NEW_NOTE);
		setPreview(false);
		refresh();
	};

	const remove = async (): Promise<void> => {
		if (editing.id === null) {
			return;
		}

		await loci().notes.delete(editing.id);
		setEditing(NEW_NOTE);
		refresh();
	};

	return (
		<section data-testid="view-notes">
			<h2>Notes</h2>
			<div className="row">
				<div className="card" style={{ width: 220 }}>
					<input
						placeholder="Search notes..."
						value={search}
						onChange={(e) => runSearch(e.target.value)}
					/>
					<button onClick={() => setEditing(NEW_NOTE)} style={{ marginTop: 8 }}>
						New note
					</button>
					{search.trim() ? (
						results.length === 0 ? (
							<p>No matches.</p>
						) : (
							<ul>
								{results.map((hit) => (
									<li key={hit.id}>
										<button
											style={{
												background: 'none',
												color: '#3b82f6',
												padding: 0,
											}}
											onClick={() =>
												open({
													id: hit.id,
													topicId: hit.topicId,
													title: hit.title ?? '',
													content: hit.content,
												})
											}
										>
											{hit.title || '(untitled)'}
										</button>
									</li>
								))}
							</ul>
						)
					) : notes.length === 0 ? (
						<p>No notes yet.</p>
					) : (
						<ul>
							{notes.map((n) => (
								<li key={n.id}>
									<button
										style={{ background: 'none', color: '#3b82f6', padding: 0 }}
										onClick={() => open(n)}
									>
										{n.title || '(untitled)'}
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
				<div className="card" style={{ flex: 1 }}>
					<input
						placeholder="Title"
						value={editing.title}
						onChange={(e) => setEditing({ ...editing, title: e.target.value })}
					/>
					<div style={{ margin: '8px 0' }}>
						<label>
							Topic:{' '}
							<select
								value={editing.topicId ?? ''}
								onChange={(e) =>
									setEditing({
										...editing,
										topicId: e.target.value ? Number(e.target.value) : null,
									})
								}
							>
								<option value="">None</option>
								{topics.map((t) => (
									<option key={t.id} value={t.id}>
										{t.name}
									</option>
								))}
							</select>
						</label>{' '}
						<button onClick={() => setPreview((v) => !v)}>
							{preview ? 'Edit' : 'Preview'}
						</button>
					</div>
					{preview ? (
						<div
							data-testid="note-preview"
							dangerouslySetInnerHTML={{ __html: renderMarkdown(editing.content) }}
						/>
					) : (
						<textarea
							rows={12}
							value={editing.content}
							onChange={(e) => setEditing({ ...editing, content: e.target.value })}
							placeholder="Write markdown..."
						/>
					)}
					<div style={{ marginTop: 8 }} className="row">
						<button onClick={() => void save()}>Save</button>
						{editing.id !== null && (
							<button onClick={() => void remove()} style={{ background: '#e5484d' }}>
								Delete
							</button>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
