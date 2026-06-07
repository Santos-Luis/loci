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

	const handleKeyDown = (e: React.KeyboardEvent): void => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			submitQuickAsk();
		}
	};

	return (
		<section data-testid="view-dashboard">
			<h1 className="page-title">Dashboard</h1>

			<div className="card">
				<p className="card-title">Quick ask</p>
				<textarea
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Ask something… (⌘↵ to send)"
					rows={3}
				/>
				<div style={{ marginTop: 10 }}>
					<button
						className="btn btn-primary"
						onClick={submitQuickAsk}
						disabled={!draft.trim()}
					>
						Ask
					</button>
				</div>
			</div>

			<div className="card">
				<p className="card-title">Latest insight</p>
				{data?.latestInsight ? (
					<p style={{ margin: 0 }}>{data.latestInsight.content}</p>
				) : (
					<p className="empty">No insights yet — the agent will generate them soon.</p>
				)}
			</div>

			<div className="card">
				<p className="card-title">Recent conversations</p>
				{data && data.recentConversations.length > 0 ? (
					<ul className="item-list">
						{data.recentConversations.map((c) => (
							<li key={c.id}>
								<button
									className="item-btn"
									onClick={() => {
										sessionStorage.setItem(
											'loci.resumeConversation',
											String(c.id),
										);
										window.location.hash = '#/ask';
									}}
								>
									{c.title}
								</button>
							</li>
						))}
					</ul>
				) : (
					<p className="empty">No conversations yet.</p>
				)}
			</div>

			<div className="card">
				<p className="card-title">Last note</p>
				{data?.lastNote ? (
					<p style={{ margin: 0 }}>{data.lastNote.title}</p>
				) : (
					<p className="empty">No notes yet.</p>
				)}
			</div>
		</section>
	);
}
