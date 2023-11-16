import { ISource } from './data/ISource.interface.ts';

export function sourceHref(source: ISource) {
	if (source.kind === 'empty-source') {
		return '';
	}
	return `/source?type=${source.type}&id=${source.id}`;
}
