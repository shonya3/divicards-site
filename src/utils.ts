import { ISource } from './data/ISource.interface.ts';

export function sourceHref(source: ISource) {
	if (source.kind === 'empty-source') {
		return '';
	}
	return `/source?type=${source.type}&id=${source.id}`;
}

export function paginate<T>(arr: T[], page: number, perPage: number): T[] {
	const start = (page - 1) * perPage;
	const end = start + perPage;
	return arr.slice(start, end);
}

export class SlConverter {
	static #SL_DELIMETER = 'sl-v' as const;
	static toSlValue<T extends string>(s: T): string {
		return s.replaceAll(' ', this.#SL_DELIMETER);
	}
	static fromSlValue<T extends string>(s: string): T {
		return s.replaceAll(this.#SL_DELIMETER, ' ') as T;
	}
}
