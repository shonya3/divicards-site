import { Order, WeightData } from './types';

export class Sort {
	static byName(cards: WeightData[], order: Order): void {
		cards.sort((a, b) => {
			if (a.disabled && !b.disabled) return 1;
			if (!a.disabled && b.disabled) return -1;
			if (a.disabled && b.disabled) return 0;
			return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
		});
	}

	static byWeight(cards: WeightData[], order: Order): void {
		cards.sort((a, b) => (order === 'asc' ? a.displayWeight - b.displayWeight : b.displayWeight - a.displayWeight));
	}

	static byDelta(cards: WeightData[], order: Order): void {
		cards.sort((a, b) => {
			if (a.disabled && !b.disabled) return 1;
			if (!a.disabled && b.disabled) return -1;
			if (a.disabled && b.disabled) return 0;
			return order === 'asc' ? a.delta - b.delta : b.delta - a.delta;
		});
	}
}
