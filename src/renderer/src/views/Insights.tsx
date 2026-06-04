import { useEffect, useState } from 'react';
import { Insight, InsightType, Topic } from '../lib/types';
import { loci } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';

type TypeFilter = 'all' | InsightType;

const TYPE_FILTERS: TypeFilter[] = ['all', 'summary', 'connection', 'question'];

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
			<h2>Insights</h2>
			<div className="card">
				{TYPE_FILTERS.map((value) => (
					<button
						key={value}
						onClick={() => changeType(value)}
						style={{
							marginRight: 8,
							background: type === value ? '#3b82f6' : '#9aa0ad',
						}}
					>
						{value}
					</button>
				))}
				<label style={{ marginLeft: 8 }}>
					Topic:{' '}
					<select
						value={topicId ?? ''}
						onChange={(e) =>
							changeTopic(e.target.value ? Number(e.target.value) : null)
						}
					>
						<option value="">All</option>
						{topics.map((t) => (
							<option key={t.id} value={t.id}>
								{t.name}
							</option>
						))}
					</select>
				</label>
			</div>
			{insights.length === 0 ? (
				<p>No insights yet.</p>
			) : (
				insights.map((insight) => (
					<div className="card" key={insight.id}>
						<strong>{insight.type}</strong>
						<div
							dangerouslySetInnerHTML={{ __html: renderMarkdown(insight.content) }}
						/>
					</div>
				))
			)}
		</section>
	);
}
