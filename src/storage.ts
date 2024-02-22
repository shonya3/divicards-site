/**
 * Registry for Storage keys and types. Use with declaration merging in any file.
 *
 * ## Example
 * ```ts
 * // DivcordLoader.ts
 * declare module './storage' {
 *     interface Registry {
 *         divcord: DivcordRecord[];
 *     }
 * }
 * ```
 */
export interface Registry {}

/** Storage that uses browser's LocalStorage. Declare key-type pair in Registry. */
export class Storage<Key extends keyof Registry, Input = Registry[Key]> {
	#key: Key;
	#serde: Serde<Registry[Key], Input>;
	#defaultValue: Registry[Key];
	constructor(key: Key, defaultValue: Registry[Key], serde: Serde<Registry[Key], Input> = new Serde()) {
		this.#key = key;
		this.#serde = serde;
		this.#defaultValue = defaultValue;
	}

	get key(): string {
		return this.#key;
	}

	get data(): Registry[Key] {
		if (!this.exists()) {
			return this.#defaultValue;
		}
		return this.#serde.deserialize(localStorage.getItem(this.key)!);
	}

	set data(v: Input) {
		const str = this.#serde.serialize(v);
		localStorage.setItem(this.key, str);
	}

	exists(): boolean {
		return localStorage.getItem(this.key) !== null;
	}

	clear(): void {
		localStorage.removeItem(this.key);
	}

	save(v: Input): void {
		this.data = v;
	}

	load(): Registry[Key] {
		return this.data;
	}
}

export class Serde<T, Input = T> {
	serialize(value: Input): string {
		return JSON.stringify(value);
	}

	deserialize(s: string): T {
		return JSON.parse(s);
	}
}
