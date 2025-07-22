export type Order = 'asc' | 'desc';
export type WeightHistory = Record<string, number>;

export type WeightDisplayKind = 'normal' | 'disabled' | 'no-data' | 'fallback-to-prerework';

export type WeightData = {
	name: string;
	disabled: boolean;
	weights: WeightHistory;
	displayKind: WeightDisplayKind;
	displayWeight: number;
	fallbackSourceLeague?: string;
};
