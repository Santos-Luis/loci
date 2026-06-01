import { mergeHits } from '../../../src/main/managers/retrieval';
import { SearchHit } from '../../../src/main/entities/search';

function hit(partial: Partial<SearchHit>): SearchHit {
	return {
		source: 'note',
		id: 1,
		topicId: null,
		title: null,
		content: 'c',
		score: -1,
		...partial,
	};
}

describe('mergeHits', () => {
	it('sorts by relevance (lower bm25 score = better) and caps the count', () => {
		const merged = mergeHits({
			groups: [[hit({ id: 1, score: -0.5 })], [hit({ id: 2, score: -2 })]],
			topicId: null,
			limit: 10,
		});
		expect(merged.map((h) => h.id)).toEqual([2, 1]);
	});

	it('boosts hits whose topic matches the conversation topic', () => {
		const merged = mergeHits({
			groups: [
				[hit({ id: 1, score: -1, topicId: 5 }), hit({ id: 2, score: -1.2, topicId: 9 })],
			],
			topicId: 5,
			limit: 10,
		});
		// id 2 has a better raw score, but id 1 is boosted for matching topic 5.
		expect(merged[0].id).toBe(1);
	});

	it('truncates to the limit', () => {
		const groups = [[hit({ id: 1 }), hit({ id: 2 }), hit({ id: 3 })]];
		expect(mergeHits({ groups, topicId: null, limit: 2 })).toHaveLength(2);
	});
});
