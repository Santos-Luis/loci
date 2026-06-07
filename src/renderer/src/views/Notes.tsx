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

	const visibleNotes = search.trim() ? results : notes;

	return (
		<section className="notes-layout" data-testid="view-notes">
			<div className="notes-panel">
				<div className="card">
					<p className="card-title">Notes</p>
					<input
						placeholder="Search…"
						value={search}
						onChange={(e) => runSearch(e.target.value)}
					/>
					<button
						className="btn btn-secondary btn-sm"
						onClick={() => setEditing(NEW_NOTE)}
						style={{ marginTop: 8 }}
					>
						+ New note
					</button>
					<div className="notes-list-scroll">
						{visibleNotes.length === 0 ? (
							<p className="empty">
								{search.trim() ? 'No matches.' : 'No notes yet.'}
							</p>
						) : (
							<ul className="item-list">
								{visibleNotes.map((n) => (
									<li key={n.id}>
										<button
											className="item-btn"
											onClick={() =>
												open({
													id: n.id,
													topicId: n.topicId,
													title: n.title ?? '',
													content: n.content,
												})
											}
										>
											{n.title || '(untitled)'}
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			</div>

			<div className="notes-editor-wrap">
				<div className="card">
					<div className="row row-center" style={{ gap: 10 }}>
						<input
							placeholder="Title"
							value={editing.title}
							onChange={(e) => setEditing({ ...editing, title: e.target.value })}
							style={{ flex: 1 }}
						/>
						<select
							value={editing.topicId ?? ''}
							onChange={(e) =>
								setEditing({
									...editing,
									topicId: e.target.value ? Number(e.target.value) : null,
								})
							}
							style={{ width: 'auto', flexShrink: 0 }}
						>
							<option value="">No topic</option>
							{topics.map((t) => (
								<option key={t.id} value={t.id}>
									{t.name}
								</option>
							))}
						</select>
						<button
							className="btn btn-secondary btn-sm"
							style={{ flexShrink: 0 }}
							onClick={() => setPreview((v) => !v)}
						>
							{preview ? 'Edit' : 'Preview'}
						</button>
					</div>

					<div className="editor-scroll">
						{preview ? (
							<div
								className="md"
								data-testid="note-preview"
								dangerouslySetInnerHTML={{
									__html: renderMarkdown(editing.content),
								}}
								style={{ padding: '12px 0' }}
							/>
						) : (
							<textarea
								rows={12}
								value={editing.content}
								onChange={(e) =>
									setEditing({ ...editing, content: e.target.value })
								}
								placeholder="Write in markdown…"
							/>
						)}
					</div>

					<div className="row" style={{ marginTop: 12 }}>
						<button className="btn btn-primary btn-sm" onClick={() => void save()}>
							{editing.id === null ? 'Create' : 'Save'}
						</button>
						{editing.id !== null && (
							<button className="btn btn-danger btn-sm" onClick={() => void remove()}>
								Delete
							</button>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
