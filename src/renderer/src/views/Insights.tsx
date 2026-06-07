import { useEffect, useState } from 'react';
import { Insight, InsightType, Topic } from '../lib/types';
import { loci } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';

type TypeFilter = 'all' | InsightType;

const TYPE_FILTERS: TypeFilter[] = ['all', 'summary', 'connection', 'question'];

const BADGE_CLASS: Record<InsightType, string> = {
	summary: 'insight-badge insight-badge-summary',
	connection: 'insight-badge insight-badge-connection',
	question: 'insight-badge insight-badge-question',
};

export function Insights() {
	const [insights, setInsights] = useState<Insight[]>([]);
	const [topics, setTopics] = useState<Topic[]>([]);
	const [type, setType] = useState<TypeFilter>('all');
	const [topicId, setTopicId] = useState<number | null>(null);

	const load = (typeValue: TypeFilter, topic: number | null): void => {
		const filter: { type?: InsightType; topicId?: number } = {};
		if (typeValue !== 'all') {
			filter.type = typeValue;
		}

		if (topic !== null) {
			filter.topicId = topic;
		}

		void loci().insights.list(filter).then(setInsights);
	};

	useEffect(() => {
		void loci().topics.list().then(setTopics);
		void loci()
			.insights.markAllRead()
			.then(() => {
				window.dispatchEvent(new Event('loci:insights-read'));
				load('all', null);
			});
	}, []);

	const changeType = (value: TypeFilter): void => {
		setType(value);
		load(value, topicId);
	};

	const changeTopic = (value: number | null): void => {
		setTopicId(value);
		load(type, value);
	};

	return (
		<section data-testid="view-insights">
			<h1 className="page-title">Insights</h1>

			<div className="card" style={{ marginBottom: 20 }}>
				<div className="row row-center" style={{ gap: 12, flexWrap: 'wrap' }}>
					<div className="pill-group">
						{TYPE_FILTERS.map((value) => (
							<button
								key={value}
								className={`pill${type === value ? ' active' : ''}`}
								onClick={() => changeType(value)}
							>
								{value.charAt(0).toUpperCase() + value.slice(1)}
							</button>
						))}
					</div>
					<select
						value={topicId ?? ''}
						onChange={(e) =>
							changeTopic(e.target.value ? Number(e.target.value) : null)
						}
						style={{ width: 'auto', marginLeft: 'auto' }}
					>
						<option value="">All topics</option>
						{topics.map((t) => (
							<option key={t.id} value={t.id}>
								{t.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{insights.length === 0 ? (
				<p className="empty" style={{ textAlign: 'center', padding: '32px 0' }}>
					No insights yet — the agent will generate them on a schedule.
				</p>
			) : (
				insights.map((insight) => (
					<div className="card" key={insight.id}>
						<span className={BADGE_CLASS[insight.type]}>{insight.type}</span>
						<div
							className="md"
							dangerouslySetInnerHTML={{ __html: renderMarkdown(insight.content) }}
						/>
					</div>
				))
			)}
		</section>
	);
}
