import { RowDataForWeightsTable, RowDataForWeightsTableVerifySources } from './types';
import { Card } from '../../gen/poeData';
import { DivcordRecord } from '../../gen/divcord';
import { Source } from '../../gen/Source';

export function weightCellContent(cardRowData: RowDataForWeightsTable | RowDataForWeightsTableVerifySources) {
	switch (cardRowData.kind) {
		case 'disabled': {
			return 'disabled';
		}
		case 'normal': {
			return formatWeight(cardRowData.weight);
		}
		case 'show-pre-rework-weight': {
			return formatWeight(cardRowData.preReworkWeight);
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

export function prepareRowData(card: Card, records: DivcordRecord[]): RowDataForWeightsTable {
	const cardRow = {
		name: card.name,
		weight: card.weight,
		preReworkWeight: card.preReworkWeight,
	};

	if (card.weight > 0) {
		return {
			kind: 'normal',
			...cardRow,
		} as const;
	}

	if (checkCardDisabled(card.name, records)) {
		return {
			kind: 'disabled',
			...cardRow,
		} as const;
	}

	return {
		kind: 'show-pre-rework-weight',
		...cardRow,
	} as const;
}

export function prepareRowDataSources(
	card: Card,
	records: Array<DivcordRecord>,
	sources: Array<Source>
): RowDataForWeightsTableVerifySources {
	const cardRow = {
		name: card.name,
		weight: card.weight,
		preReworkWeight: card.preReworkWeight,
		sources,
	};

	if (card.weight > 0) {
		return {
			kind: 'normal',
			...cardRow,
		} as const;
	}

	if (checkCardDisabled(card.name, records)) {
		return {
			kind: 'disabled',
			...cardRow,
		} as const;
	}

	return {
		kind: 'show-pre-rework-weight',
		...cardRow,
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
