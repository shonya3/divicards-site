import { WeightData } from './types';
import type { Card } from '../../../gen/poeData';
import { poeData } from '../../PoeData';
import { getLatestVersions } from './weights.js';

export function prepare_weight_data(card: Card): WeightData {
	const weights = structuredClone(card.weights);

	if (card.disabled) {
		return {
			name: card.name,
			disabled: true,
			weights,
			displayKind: 'disabled',
			displayWeight: -1, // Sorts disabled cards to the top on ascending sort, and to the bottom on descending sort.
			delta: 0,
		};
	}

	const { latest, previous, allSorted } = getLatestVersions(weights);
	const latestWeight = latest ? weights[latest] : 0;

	if (latestWeight > 0) {
		const previousWeight = previous ? weights[previous] : 0;
		const delta = latestWeight - previousWeight;
		return { name: card.name, disabled: false, weights, displayKind: 'normal', displayWeight: latestWeight, delta };
	}

	// Handle cases where latestWeight is 0
	const firstNonZeroLeague = allSorted.find(league => weights[league] > 0);
	if (firstNonZeroLeague) {
		// If the most recent non-zero weight is from the pre-rework league,
		// we always fall back to it, for both high and low-weight cards.
		if (firstNonZeroLeague === '3.23') {
			return {
				name: card.name,
				disabled: false,
				weights,
				displayKind: 'fallback-to-prerework',
				displayWeight: weights['3.23'],
				fallbackSourceLeague: '3.23',
				delta: 0, // No meaningful delta to sort by
			};
		}

		// For any card with a weight of 0 and more recent history, we display "no data".
		return { name: card.name, disabled: false, weights, displayKind: 'no-data', displayWeight: 0, delta: 0 };
	}

	// Card has no weight history at all, show "no data".
	return {
		name: card.name,
		disabled: card.disabled,
		weights,
		displayKind: 'no-data',
		displayWeight: 0,
		delta: 0,
	};
}

/** Rows data for weights table */
export function prepare_rows(): Array<WeightData> {
	const rows = Object.values(poeData.cards).map(prepare_weight_data);
	rows.sort((a, b) => b.displayWeight - a.displayWeight);
	return rows;
}
