export type Order = 'asc' | 'desc';
export type WeightHistory = Record<string, number>;

export type WeightData = {
	name: string;
	disabled: boolean;
	weights: WeightHistory;
	latestWeight: number;
};
