import type { Source } from '../../gen/Source';

export type Order = 'asc' | 'desc';

export type WeightData = {
	kind: WeightKind;
	name: string;
	weight: number;
	preReworkWeight: number;
};
export type WeightKind = 'disabled' | 'normal' | 'show-pre-rework-weight';
export type RowDataForWeightsTableVerifySources = WeightData & { sources: Source[] };
