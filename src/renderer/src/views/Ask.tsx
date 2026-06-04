import { useEffect, useState } from 'react';
import { RetrievedContext, Topic } from '../lib/types';
import { loci } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';

type Display = {
	role: 'user' | 'assistant';
	content: string;
	context?: RetrievedContext;
};

export function Ask() {
	const [conversationId, setConversationId] = useState<number | null>(null);
	const [topicId, setTopicId] = useState<number | null>(null);
	const [topics, setTopics] = useState<Topic[]>([]);
	const [messages, setMessages] = useState<Display[]>([]);
	const [input, setInput] = useState('');
	const [streaming, setStreaming] = useState<string | null>(null);
	const [openContext, setOpenContext] = useState<number | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		void loci().topics.list().then(setTopics);
		const cleanup = loci().ask.onToken((token) => {
			setStreaming((prev) => (prev === null ? prev : prev + token));
		});

		const draft = sessionStorage.getItem('loci.quickAsk');
		if (draft) {
			sessionStorage.removeItem('loci.quickAsk');
			setInput(draft);
		}

		return cleanup;
	}, []);

	const send = async (): Promise<void> => {
		const text = input.trim();
		if (!text || busy) {
			return;
		}

		setInput('');
		setBusy(true);
		setMessages((prev) => [...prev, { role: 'user', content: text }]);
		setStreaming('');

		try {
			const result = await loci().ask.send({ conversationId, message: text, topicId });
			setConversationId(result.conversationId);
			setMessages((prev) => [
				...prev,
				{ role: 'assistant', content: result.message.content, context: result.context },
			]);
		} finally {
			setStreaming(null);
			setBusy(false);
		}
	};

	return (
		<section data-testid="view-ask">
			<h2>Ask</h2>
			<div className="card">
				<label>
					Topic tag:{' '}
					<select
						value={topicId ?? ''}
						onChange={(e) => setTopicId(e.target.value ? Number(e.target.value) : null)}
					>
						<option value="">None</option>
						{topics.map((t) => (
							<option key={t.id} value={t.id}>
								{t.name}
							</option>
						))}
					</select>
				</label>
			</div>
			<div className="card" data-testid="messages">
				{messages.map((m, i) => (
					<div key={i} className={m.role === 'user' ? 'msg-user' : 'msg-assistant'}>
						{m.role === 'assistant' ? (
							<div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
						) : (
							m.content
						)}
						{m.role === 'assistant' && m.context && (
							<div className="context">
								<button
									onClick={() => setOpenContext((cur) => (cur === i ? null : i))}
								>
									{openContext === i ? 'Hide' : 'Show'} context (
									{m.context.hits.length} memories)
								</button>
								{openContext === i && (
									<ul data-testid="context-panel">
										{m.context.hits.map((h) => (
											<li key={`${h.source}-${h.id}`}>
												[{h.source}] {h.title ?? h.content.slice(0, 60)}
											</li>
										))}
									</ul>
								)}
							</div>
						)}
					</div>
				))}
				{streaming !== null && <div className="msg-assistant">{streaming}</div>}
			</div>
			<div className="row">
				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					rows={2}
					placeholder="Type a message..."
				/>
				<button onClick={() => void send()} disabled={busy}>
					Send
				</button>
			</div>
		</section>
	);
}
