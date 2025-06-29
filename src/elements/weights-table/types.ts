export type Order = 'asc' | 'desc';
export type WeightData = {
	kind: WeightKind;
	name: string;
	weight: number;
};
export type WeightKind = 'disabled' | 'normal' | 'show-pre-rework-weight' | 'no-data';
