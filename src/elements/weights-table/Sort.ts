import { Order, RowDataForWeightsTable } from './types';

export class Sort {
	static byName(cards: RowDataForWeightsTable[], order: Order): void {
		cards.sort((a, b) => (order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
	}

	static byWeight(cards: RowDataForWeightsTable[], order: Order): void {
		cards.sort((a, b) => (order === 'asc' ? a.weight - b.weight : b.weight - a.weight));
	}
}
