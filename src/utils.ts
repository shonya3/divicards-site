import { TemplateResult, html } from 'lit';
import { asyncAppend } from 'lit/directives/async-append.js';
import type { Source } from './gen/Source';

export function sourceHref(source: Source) {
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
		return html`${asyncAppend(
			this.#generator,
			//@ts-expect-error
			cb
		)}`;
	}
}

/** Declare locally to make sure calling the method from document object is not possible. */
interface ViewTransitionAPI {
	startViewTransition: (cb: (...args: any[]) => any) => Promise<ViewTransition>;
}

export interface ViewTransition {
	get ready(): Promise<void>;
	get finished(): Promise<void>;
	get updateCallbackDone(): Promise<void>;
	skipTransition: () => void;
}

export async function startViewTransition(cb: (...args: any[]) => any): Promise<ViewTransition | void> {
	if (Object.hasOwn(Document.prototype, 'startViewTransition')) {
		return (document as Document & ViewTransitionAPI).startViewTransition(() => {
			cb();
		});
	} else {
		cb();
	}
}

export class EventEmitter<Events> extends EventTarget {
	//@ts-expect-error
	addEventListener<Key extends keyof Events>(type: Key, callback: (e: CustomEvent<Events[Key]>) => void) {
		//@ts-expect-error
		super.addEventListener(type, callback);
	}

	emit<Key extends keyof Events>(type: Key, detail: Events[Key]) {
		//@ts-expect-error
		super.dispatchEvent(new CustomEvent<Events[Key]>(type, { detail }));
	}
}
