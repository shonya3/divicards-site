import { WeightData, RowDataForWeightsTableVerifySources } from './types';
import { Card } from '../../gen/poeData';
import { Source } from '../../gen/Source';

export function weightCellContent(weightData: WeightData | RowDataForWeightsTableVerifySources) {
	switch (weightData.kind) {
		case 'disabled': {
			return 'disabled';
		}
		case 'normal': {
			return formatWeight(weightData.weight);
		}
		case 'show-pre-rework-weight': {
			return formatWeight(weightData.weight);
		}
	}
}

const fmts = {
	'0': new Intl.NumberFormat('ru', { maximumFractionDigits: 0 }),
	'2': new Intl.NumberFormat('ru', { maximumFractionDigits: 2 }),
};
function formatWeight(weight: number, formatters: Record<0 | 2, Intl.NumberFormat> = fmts) {
	const maximumFractionDigits = weight > 5 ? 0 : 2;
	return formatters[maximumFractionDigits].format(weight);
}

export function prepareWeightData(card: Card): WeightData {
	if (card.weight > 0) {
		return {
			kind: 'normal',
			name: card.name,
			weight: card.weight,
		} as const;
	}

	if (card.disabled) {
		return {
			kind: 'disabled',
			name: card.name,
			weight: 0,
		} as const;
	}

	return {
		kind: 'show-pre-rework-weight',
		name: card.name,
		weight: card.preReworkWeight,
	} as const;
}

export function prepareWeightDataSources(card: Card, sources: Array<Source>): RowDataForWeightsTableVerifySources {
	if (card.weight > 0) {
		return {
			kind: 'normal',
			weight: card.weight,
			name: card.name,
			sources,
		} as const;
	}

	if (card.disabled) {
		return {
			kind: 'disabled',
			weight: 0,
			name: card.name,
			sources,
		} as const;
	}

	return {
		kind: 'show-pre-rework-weight',
		weight: card.preReworkWeight,
		name: card.name,
		sources,
	} as const;
}
