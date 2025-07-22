import { WeightData } from './types';
import type { Card } from '../../../gen/poeData';
import { poeData } from '../../PoeData';
import * as semver from 'semver';

export function prepare_weight_data(card: Card): WeightData {
	const weights = structuredClone(card.weights);

	if (card.disabled) {
		return {
			name: card.name,
			disabled: true,
			weights,
			displayKind: 'disabled',
			displayWeight: -1, // Sort disabled cards to the bottom
		};
	}

	const leagueNames = Object.keys(weights).sort((a, b) =>
		semver.rcompare(semver.coerce(a) ?? '0.0.0', semver.coerce(b) ?? '0.0.0')
	);
	const latestWeight = leagueNames.length > 0 ? weights[leagueNames[0]] : 0;

	if (latestWeight > 0) {
		return { name: card.name, disabled: false, weights, displayKind: 'normal', displayWeight: latestWeight };
	}

	// Handle cases where latestWeight is 0
	const firstNonZeroLeague = leagueNames.find(league => weights[league] > 0);
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
			};
		}

		// For any card with a weight of 0 and more recent history, we display "no data".
		return { name: card.name, disabled: false, weights, displayKind: 'no-data', displayWeight: 0 };
	}

	// Card has no weight history at all, show "no data".
	return {
		name: card.name,
		disabled: card.disabled,
		weights,
		displayKind: 'no-data',
		displayWeight: 0,
	};
}

/** Rows data for weights table */
export function prepare_rows(): Array<WeightData> {
	const rows = Object.values(poeData.cards).map(prepare_weight_data);
	rows.sort((a, b) => b.displayWeight - a.displayWeight);
	return rows;
}
