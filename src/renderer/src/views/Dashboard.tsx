import { useEffect, useState } from 'react';
import { DashboardData } from '../lib/types';
import { loci } from '../lib/api';

export function Dashboard() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [draft, setDraft] = useState('');

	useEffect(() => {
		void loci().dashboard.get().then(setData);
	}, []);

	const submitQuickAsk = (): void => {
		const text = draft.trim();
		if (!text) {
			return;
		}

		sessionStorage.setItem('loci.quickAsk', text);
		window.location.hash = '#/ask';
	};

	return (
		<section data-testid="view-dashboard">
			<h2>Dashboard</h2>
			<div className="card">
				<h3>Quick ask</h3>
				<textarea
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					placeholder="Ask something..."
					rows={2}
				/>
				<div style={{ marginTop: 8 }}>
					<button onClick={submitQuickAsk}>Ask</button>
				</div>
			</div>
			<div className="card">
				<h3>Latest insight</h3>
				{data?.latestInsight ? (
					<p>{data.latestInsight.content}</p>
				) : (
					<p>No new insights.</p>
				)}
			</div>
			<div className="card">
				<h3>Recent conversations</h3>
				{data && data.recentConversations.length > 0 ? (
					<ul>
						{data.recentConversations.map((c) => (
							<li key={c.id}>{c.title}</li>
						))}
					</ul>
				) : (
					<p>No conversations yet.</p>
				)}
			</div>
			<div className="card">
				<h3>Last note</h3>
				{data?.lastNote ? <p>{data.lastNote.title}</p> : <p>No notes yet.</p>}
			</div>
		</section>
	);
}
