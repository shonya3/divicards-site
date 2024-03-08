import type { Source } from '../../gen/Source';
import type { Card } from '../../gen/poeData';

export type Order = 'asc' | 'desc';
export type RowDataForWeightsTableCard = Pick<Card, 'name' | 'weight'>;
export type RowDataForWeightsTableVerifySources = RowDataForWeightsTableCard & { sources: Source[] };
