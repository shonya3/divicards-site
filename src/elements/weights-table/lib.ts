import { WeightData } from './types';
import { Card } from '../../gen/poeData';

export function prepareWeightData(card: Card): WeightData {
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
			weight: 0,
		};
	}

	return {
		kind: 'show-pre-rework-weight',
		name: card.name,
		weight: card.preReworkWeight,
	};
}
