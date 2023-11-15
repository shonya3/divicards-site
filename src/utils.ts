import { ISource } from './data/ISource.interface.ts';

export function sourceHref(source: ISource) {
	if (!source.id) {
		return '';
	}
	return `/source?type=${source.type}&id=${source.id}`;
}
