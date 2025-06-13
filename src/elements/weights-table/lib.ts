import { WeightData } from './types';
import { Card } from '../../../gen/poeData';
import { poeData } from '../../PoeData';

export function prepare_weight_data(card: Card): WeightData {
	if (card.weight > 0) {
		return {
			kind: 'normal',
			name: card.name,
			weight: card.weight,
		};
	}

	if (card.disabled) {
		return {
			kind: 'disabled',
			name: card.name,
			weight: -1,
		};
	}

	return {
		kind: 'show-pre-rework-weight',
		name: card.name,
		weight: card.preReworkWeight,
	};
}

/** Rows data for weights table */
export function prepare_rows(): Array<WeightData> {
	const rows = Object.values(poeData.cards).map(prepare_weight_data);
	rows.sort((a, b) => b.weight - a.weight);
	return rows;
}
