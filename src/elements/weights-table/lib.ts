import { WeightData } from './types';
import type { Card } from '../../../gen/poeData';
import { poeData } from '../../PoeData';
import * as semver from 'semver';

export function prepare_weight_data(card: Card): WeightData {
	const weights = structuredClone(card.weights);
	const leagueNames = Object.keys(weights).sort((a, b) =>
		semver.rcompare(semver.coerce(a) ?? '0.0.0', semver.coerce(b) ?? '0.0.0')
	);
	const latestWeight = leagueNames.length > 0 ? weights[leagueNames[0]] : 0;

	return {
		name: card.name,
		disabled: card.disabled,
		weights,
		latestWeight: card.disabled ? -1 : latestWeight,
	};
}

/** Rows data for weights table */
export function prepare_rows(): Array<WeightData> {
	const rows = Object.values(poeData.cards).map(prepare_weight_data);
	rows.sort((a, b) => b.latestWeight - a.latestWeight);
	return rows;
}
