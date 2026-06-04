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
			<h2>Topics</h2>
			<div className="card">
				<h3>New topic</h3>
				<input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
				<input
					placeholder="Description (optional)"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					style={{ marginTop: 8 }}
				/>
				{error && <p style={{ color: '#e5484d' }}>{error}</p>}
				<div style={{ marginTop: 8 }}>
					<button onClick={() => void create()}>Create</button>
				</div>
			</div>
			<div className="card">
				<h3>Your topics</h3>
				{topics.length === 0 ? (
					<p>No topics yet.</p>
				) : (
					<ul>
						{topics.map((t) => (
							<li key={t.id}>
								<button
									onClick={() => void openTopic(t.id)}
									style={{ background: 'none', color: '#3b82f6', padding: 0 }}
								>
									{t.name}
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
			{detail && (
				<div className="card" data-testid="topic-detail">
					<h3>{detail.topic.name}</h3>
					{detail.topic.description && <p>{detail.topic.description}</p>}
					<p>
						Notes: {detail.notes.length} · Conversations: {detail.conversations.length}{' '}
						· Insights: {detail.insights.length}
					</p>
					<h4>Notes</h4>
					{detail.notes.length === 0 ? (
						<p>None.</p>
					) : (
						<ul>
							{detail.notes.map((n) => (
								<li key={n.id}>{n.title || '(untitled)'}</li>
							))}
						</ul>
					)}
					<h4>Conversations</h4>
					{detail.conversations.length === 0 ? (
						<p>None.</p>
					) : (
						<ul>
							{detail.conversations.map((c) => (
								<li key={c.id}>{c.title || '(untitled)'}</li>
							))}
						</ul>
					)}
					<h4>Insights</h4>
					{detail.insights.length === 0 ? (
						<p>None.</p>
					) : (
						<ul>
							{detail.insights.map((i) => (
								<li key={i.id}>
									<strong>{i.type}</strong>: {i.content.slice(0, 80)}
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</section>
	);
}
