import { useEffect, useState } from 'react';
import { Topic, TopicDetail } from '../lib/types';
import { loci } from '../lib/api';

export function Topics() {
	const [topics, setTopics] = useState<Topic[]>([]);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [detail, setDetail] = useState<TopicDetail | null>(null);
	const [error, setError] = useState('');

	const refresh = (): void => {
		void loci().topics.list().then(setTopics);
	};

	useEffect(() => {
		refresh();
	}, []);

	const create = async (): Promise<void> => {
		if (!name.trim()) {
			setError('Name is required');

			return;
		}

		setError('');
		await loci().topics.create({ name: name.trim(), description: description.trim() || null });
		setName('');
		setDescription('');
		refresh();
	};

	const openTopic = async (id: number): Promise<void> => {
		setDetail(await loci().topics.get(id));
	};

	return (
		<section data-testid="view-topics">
			<h1 className="page-title">Topics</h1>

			<div className="card">
				<p className="card-title">New topic</p>
				<div className="field">
					<input
						placeholder="Name"
						value={name}
						onChange={(e) => {
							setName(e.target.value);
							setError('');
						}}
					/>
					{error && <p className="error-msg">{error}</p>}
				</div>
				<div className="field">
					<input
						placeholder="Description (optional)"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>
				<button className="btn btn-primary btn-sm" onClick={() => void create()}>
					Create
				</button>
			</div>

			<div className="card">
				<p className="card-title">Your topics</p>
				{topics.length === 0 ? (
					<p className="empty">No topics yet.</p>
				) : (
					<ul className="item-list">
						{topics.map((t) => (
							<li key={t.id}>
								<button className="item-btn" onClick={() => void openTopic(t.id)}>
									{t.name}
									{t.description && (
										<span style={{ color: 'var(--text-3)', marginLeft: 8 }}>
											{t.description}
										</span>
									)}
								</button>
							</li>
						))}
					</ul>
				)}
			</div>

			{detail && (
				<div className="card" data-testid="topic-detail">
					<p className="card-title">{detail.topic.name}</p>
					{detail.topic.description && (
						<p style={{ margin: '0 0 16px', color: 'var(--text-2)' }}>
							{detail.topic.description}
						</p>
					)}

					<div className="stat-row">
						<div>
							<p className="stat-value">{detail.notes.length}</p>
							<p className="stat-label">Notes</p>
						</div>
						<div>
							<p className="stat-value">{detail.conversations.length}</p>
							<p className="stat-label">Conversations</p>
						</div>
						<div>
							<p className="stat-value">{detail.insights.length}</p>
							<p className="stat-label">Insights</p>
						</div>
					</div>

					{detail.notes.length > 0 && (
						<>
							<p className="card-title" style={{ marginTop: 16 }}>
								Notes
							</p>
							<ul className="item-list">
								{detail.notes.map((n) => (
									<li key={n.id}>
										<span className="item-btn" style={{ cursor: 'default' }}>
											{n.title || '(untitled)'}
										</span>
									</li>
								))}
							</ul>
						</>
					)}

					{detail.conversations.length > 0 && (
						<>
							<p className="card-title" style={{ marginTop: 16 }}>
								Conversations
							</p>
							<ul className="item-list">
								{detail.conversations.map((c) => (
									<li key={c.id}>
										<span className="item-btn" style={{ cursor: 'default' }}>
											{c.title || '(untitled)'}
										</span>
									</li>
								))}
							</ul>
						</>
					)}

					{detail.insights.length > 0 && (
						<>
							<p className="card-title" style={{ marginTop: 16 }}>
								Insights
							</p>
							<ul className="item-list">
								{detail.insights.map((i) => (
									<li key={i.id}>
										<span className="item-btn" style={{ cursor: 'default' }}>
											<strong>{i.type}:</strong> {i.content.slice(0, 80)}
											{i.content.length > 80 ? '…' : ''}
										</span>
									</li>
								))}
							</ul>
						</>
					)}
				</div>
			)}
		</section>
	);
}
