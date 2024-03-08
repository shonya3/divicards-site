import type { Source } from '../../gen/Source';
import type { Card } from '../../gen/poeData';

export type Order = 'asc' | 'desc';
export type RowDataForWeightsTable = Pick<Card, 'name' | 'weight'>;
export type RowDataForWeightsTableVerifySources = RowDataForWeightsTable & { sources: Source[] };
