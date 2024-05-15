import { WeightData, RowDataForWeightsTableVerifySources } from './types';
import { Card } from '../../gen/poeData';
import { DivcordRecord } from '../../gen/divcord';
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

export function prepareWeightData(card: Card, records: DivcordRecord[]): WeightData {
	if (card.weight > 0) {
		return {
			kind: 'normal',
			name: card.name,
			weight: card.weight,
		} as const;
	}

	if (checkCardDisabled(card.name, records)) {
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

export function prepareWeightDataSources(
	card: Card,
	records: Array<DivcordRecord>,
	sources: Array<Source>
): RowDataForWeightsTableVerifySources {
	if (card.weight > 0) {
		return {
			kind: 'normal',
			weight: card.weight,
			name: card.name,
			sources,
		} as const;
	}

	if (checkCardDisabled(card.name, records)) {
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

export function checkCardDisabled(name: string, records: DivcordRecord[]): boolean {
	for (const record of records) {
		if (record.card === name && record.sources.map(s => s.type).includes('Disabled')) {
			return true;
		}
	}

	return false;
}
