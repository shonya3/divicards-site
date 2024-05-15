import type { Source } from '../../gen/Source';

export type Order = 'asc' | 'desc';

export type RowDataForWeightsTable = {
	kind: 'disabled' | 'normal' | 'show-pre-rework-weight';
	name: string;
	weight: number;
	preReworkWeight: number;
};
export type RowDataForWeightsTableVerifySources = RowDataForWeightsTable & { sources: Source[] };
