import { useEffect, useRef, useState } from 'react';
import { Conversation, RetrievedContext, Topic } from '../lib/types';
import { loci } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';

type Display = {
	role: 'user' | 'assistant';
	content: string;
	context?: RetrievedContext;
};

export function Ask() {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [conversationId, setConversationId] = useState<number | null>(null);
	const [topicId, setTopicId] = useState<number | null>(null);
	const [topics, setTopics] = useState<Topic[]>([]);
	const [messages, setMessages] = useState<Display[]>([]);
	const [input, setInput] = useState('');
	const [streaming, setStreaming] = useState<string | null>(null);
	const [openContext, setOpenContext] = useState<number | null>(null);
	const [busy, setBusy] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	const refreshConversations = (): void => {
		void loci().conversations.list().then(setConversations);
	};

	const loadConversation = async (id: number): Promise<void> => {
		const [conv, msgs] = await Promise.all([
			loci().conversations.get(id),
			loci().conversations.messages(id),
		]);

		setConversationId(id);
		setTopicId(conv?.topicId ?? null);
		setMessages(msgs.map((m) => ({ role: m.role, content: m.content })));
		setOpenContext(null);
	};

	const startNew = (): void => {
		setConversationId(null);
		setTopicId(null);
		setMessages([]);
		setInput('');
		setOpenContext(null);
	};

	useEffect(() => {
		void loci().topics.list().then(setTopics);
		refreshConversations();

		const cleanup = loci().ask.onToken((token) => {
			setStreaming((prev) => (prev === null ? prev : prev + token));
		});

		const draft = sessionStorage.getItem('loci.quickAsk');
		if (draft) {
			sessionStorage.removeItem('loci.quickAsk');
			setInput(draft);
		}

		const resumeId = sessionStorage.getItem('loci.resumeConversation');
		if (resumeId) {
			sessionStorage.removeItem('loci.resumeConversation');
			void loadConversation(Number(resumeId));
		}

		return cleanup;
	}, []);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, streaming]);

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
			refreshConversations();
		} finally {
			setStreaming(null);
			setBusy(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent): void => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			void send();
		}
	};

	const activeTitle =
		conversationId !== null
			? (conversations.find((c) => c.id === conversationId)?.title ?? 'Conversation')
			: 'New conversation';

	return (
		<section className="ask-layout" data-testid="view-ask">
			<div className="conv-panel">
				<div className="conv-panel-header">
					<button
						className={`btn btn-sm ${conversationId === null ? 'btn-primary' : 'btn-secondary'}`}
						style={{ width: '100%' }}
						onClick={startNew}
					>
						+ New conversation
					</button>
				</div>
				<div className="conv-list">
					{conversations.length === 0 ? (
						<p className="empty" style={{ padding: '12px 0', textAlign: 'center' }}>
							No history yet.
						</p>
					) : (
						<ul className="item-list" style={{ padding: 0 }}>
							{conversations.map((c) => (
								<li key={c.id} style={{ border: 'none' }}>
									<button
										className={`conv-item-btn${conversationId === c.id ? ' active' : ''}`}
										onClick={() => void loadConversation(c.id)}
										title={c.title || '(untitled)'}
									>
										{c.title || '(untitled)'}
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			<div className="ask-chat">
				<div className="ask-header">
					<div className="row row-center" style={{ gap: 12 }}>
						<h1
							className="page-title"
							style={{
								margin: 0,
								flex: 1,
								minWidth: 0,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{activeTitle}
						</h1>
						<select
							value={topicId ?? ''}
							onChange={(e) => {
								const newTopicId = e.target.value ? Number(e.target.value) : null;
								setTopicId(newTopicId);
								if (conversationId !== null) {
									void loci()
										.conversations.update({
											id: conversationId,
											topicId: newTopicId,
										})
										.then((updated) => {
											setConversations((prev) =>
												prev.map((c) =>
													c.id === updated.id ? updated : c,
												),
											);
										});
								}
							}}
							style={{ width: 'auto', flexShrink: 0 }}
						>
							<option value="">No topic</option>
							{topics.map((t) => (
								<option key={t.id} value={t.id}>
									{t.name}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="ask-messages-wrap">
					<div className="messages" data-testid="messages">
						{messages.length === 0 && streaming === null && (
							<p className="empty" style={{ textAlign: 'center', padding: '48px 0' }}>
								Ask anything — Loci will search your notes and memory to answer.
							</p>
						)}
						{messages.map((m, i) => (
							<div
								key={i}
								className={m.role === 'user' ? 'msg msg-user' : 'msg msg-assistant'}
							>
								<span className="msg-label">
									{m.role === 'user' ? 'You' : 'Loci'}
								</span>
								<div className="msg-bubble">
									{m.role === 'assistant' ? (
										<div
											className="md"
											dangerouslySetInnerHTML={{
												__html: renderMarkdown(m.content),
											}}
										/>
									) : (
										m.content
									)}
								</div>
								{m.role === 'assistant' && m.context && (
									<div className="context-toggle">
										<button
											className="btn btn-ghost btn-sm"
											onClick={() =>
												setOpenContext((cur) => (cur === i ? null : i))
											}
										>
											{openContext === i ? '↑ Hide' : '↓ Show'} sources (
											{m.context.hits.length})
										</button>
										{openContext === i && (
											<div className="context-panel">
												<ul data-testid="context-panel">
													{m.context.hits.map((h) => (
														<li key={`${h.source}-${h.id}`}>
															<strong>[{h.source}]</strong>{' '}
															{h.title ?? h.content.slice(0, 60)}
														</li>
													))}
												</ul>
											</div>
										)}
									</div>
								)}
							</div>
						))}
						{streaming !== null && (
							<div className="msg msg-assistant">
								<span className="msg-label">Loci</span>
								<div className="msg-streaming">{streaming}</div>
							</div>
						)}
						<div ref={bottomRef} />
					</div>
				</div>

				<div className="ask-footer">
					<div className="ask-input-row">
						<textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							rows={2}
							placeholder="Type a message… (⌘↵ to send)"
						/>
						<button
							className="btn btn-primary"
							onClick={() => void send()}
							disabled={busy}
						>
							{busy ? '…' : 'Send'}
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
