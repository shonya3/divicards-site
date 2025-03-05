import { TemplateResult, html } from 'lit';
import { asyncAppend } from 'lit/directives/async-append.js';
import type { Source } from './gen/Source';
import type { PoeData } from './PoeData';
import type { DivcordRecord } from './gen/divcord';
import { UnsafeHTMLDirective, unsafeHTML } from 'lit/directives/unsafe-html.js';
import { DirectiveResult } from 'lit/async-directive.js';

export function sourceHref(source: Source): string {
	if (source.kind === 'category') {
		return '';
	}
	return `/source/${source.typeSlug}/${source.idSlug}`;
	// return `/source?type=${source.type}&id=${source.id}`;
}

export function paginate<T>(arr: T[], page: number, perPage: number): T[] {
	const start = (page - 1) * perPage;
	const end = start + perPage;
	return arr.slice(start, end);
}

export function escapeHtml(html: string): string {
	const div = document.createElement('div');
	div.textContent = html;
	return div.innerHTML;
}

export class SlConverter {
	static #SL_DELIMETER = 'sl-v' as const;
	static toSlValue<T extends string>(s: T): string {
		return s.replaceAll(' ', this.#SL_DELIMETER);
	}
	static fromSlValue<T extends string>(s: string): T {
		return s.replaceAll(SlConverter.#SL_DELIMETER, ' ') as T;
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
		return html`${asyncAppend(
			this.#generator,
			//@ts-expect-error do not need default signature
			cb
		)}`;
	}
}

export function startViewTransition(cb: (...args: unknown[]) => unknown): ViewTransition | void {
	if (!document.startViewTransition) {
		cb();
		return;
	}
	return document.startViewTransition(cb);
}

export class EventEmitter<Events> {
	#eventTarget = new EventTarget();

	addEventListener<Key extends keyof Events & string>(type: Key, callback: (e: Events[Key]) => void): void {
		this.#eventTarget.addEventListener(type, e => callback((e as CustomEvent<Events[Key]>).detail));
	}

	emit<Key extends keyof Events & string>(type: Key, detail: Events[Key]): void {
		this.#eventTarget.dispatchEvent(new CustomEvent<Events[Key]>(type, { detail, composed: true, bubbles: true }));
	}

	on<Key extends keyof Events & string>(type: Key, callback: (e: Events[Key]) => void): void {
		this.#eventTarget.addEventListener(type, e => callback((e as CustomEvent<Events[Key]>).detail));
	}
}

export function sortAllSourcesByLevel(records: DivcordRecord[], poeData: Readonly<PoeData>): void {
	records.forEach(({ sources }) => sortSourcesByLevel(sources, poeData));
}

export function sortSourcesByLevel(sources: Source[], poeData: Readonly<PoeData>): void {
	sources.sort((s1, s2) => {
		// if source has no level, put it to the end
		const level1 = sourceLevel(s1, poeData) ?? 200;
		const level2 = sourceLevel(s2, poeData) ?? 200;
		return level1 - level2;
	});
}

export function sourceLevel(source: Source, poeData: Readonly<PoeData>): number | null {
	switch (source.type) {
		case 'Act': {
			return poeData.areaLevel(source.id, source.type);
		}
		case 'Act Boss': {
			const b = poeData.find.actBossAndArea(source.id);
			if (!b) return null;
			return b.area.areaLevel;
		}
		case 'Map': {
			return poeData.areaLevel(source.id, source.type);
		}
		case 'Map Boss': {
			const b = poeData.find.mapBoss(source.id);
			if (!b) return null;
			const mapLevels: number[] = [];
			for (const map of b.maps) {
				const level = poeData.areaLevel(map, 'Map');
				if (level !== null) {
					mapLevels.push(level);
				}
			}
			const minLevel = Math.min(...mapLevels);
			return minLevel === Infinity ? null : minLevel;
		}
		default: {
			return null;
		}
	}
}

export function formatWithNewlines(
	markup = '',
	options?: { escape: boolean }
): DirectiveResult<typeof UnsafeHTMLDirective> {
	const escape = options?.escape ?? true;
	if (!escape) {
		return unsafeHTML(markup.replaceAll('\n', '<br>'));
	}

	return unsafeHTML(escapeHtml(markup).replaceAll('\n', '<br>'));
}

export function divcordRecordHref(id: DivcordRecord['id']) {
	return `https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/edit?pli=1#gid=0&range=B${id}`;
}
