import { DivcordRecordAndWeight } from './e-divcord-spreadsheet';

export type Order = 'asc' | 'desc';
export type SortColums = 'card' | 'weight' | 'id' | 'verify';

export class Sort {
	static byCard(records: DivcordRecordAndWeight[], order: Order): void {
		records.sort((a, b) => (order === 'asc' ? a.card.localeCompare(b.card) : b.card.localeCompare(a.card)));
	}

	static byWeight(records: DivcordRecordAndWeight[], order: Order): void {
		records.sort((a, b) =>
			order === 'asc' ? Number(a.weight) - Number(b.weight) : Number(b.weight) - Number(a.weight)
		);
	}

	static byId(records: DivcordRecordAndWeight[], order: Order): void {
		records.sort((a, b) => (order === 'asc' ? a.id - b.id : b.id - a.id));
	}

	static byVerify(records: DivcordRecordAndWeight[], order: Order): void {
		records.sort((a, b) =>
			order === 'asc'
				? a.verifySources.length - b.verifySources.length
				: b.verifySources.length - a.verifySources.length
		);
	}

	static by(column: SortColums, records: DivcordRecordAndWeight[], order: Order): void {
		switch (column) {
			case 'card':
				return Sort.byCard(records, order);
			case 'id':
				return Sort.byId(records, order);
			case 'verify':
				return Sort.byVerify(records, order);
			case 'weight':
				return Sort.byWeight(records, order);
		}
	}
}
