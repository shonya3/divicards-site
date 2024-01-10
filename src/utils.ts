import { TemplateResult } from 'lit';
import type { ISource } from './gen/ISource.interface';

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

export type ElementRenderCallback<T> = (el: T, index: number) => TemplateResult;
export class ArrayAsyncRenderer<T> {
	#generator: AsyncGenerator<T>;
	#elementRender?: ElementRenderCallback<T>;
	constructor(arr: T[], elementRender?: ElementRenderCallback<T>) {
		this.#generator = this.#initGenerator(arr);
		this.#elementRender = elementRender;
	}

	async *#initGenerator(arr: T[]) {
		for (const el of arr) {
			yield el;
			await new Promise(r => setTimeout(r));
		}
	}

	render(cb = this.#elementRender) {
		//@ts-expect-error
		return html`${asyncAppend(this.#generator, cb)}`;
	}
}
