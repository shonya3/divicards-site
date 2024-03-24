import { DivcordRecordAndWeight } from './e-divcord-spreadsheet';

export type Order = 'asc' | 'desc';

export class Sort {
	static byCard(cards: DivcordRecordAndWeight[], order: Order): void {
		cards.sort((a, b) => (order === 'asc' ? a.card.localeCompare(b.card) : b.card.localeCompare(a.card)));
	}

	static byWeight(cards: DivcordRecordAndWeight[], order: Order): void {
		cards.sort((a, b) =>
			order === 'asc' ? Number(a.weight) - Number(b.weight) : Number(b.weight) - Number(a.weight)
		);
	}
}
