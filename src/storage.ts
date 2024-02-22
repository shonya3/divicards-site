/**
 * Registry for Storage keys and types. Use with declaration merging in any file.
 *
 * ## Example
 * ```ts
 * // DivcordLoader.ts
 * declare module './storage' {
 *     interface StorageRegistry {
 *         divcord: DivcordRecord[];
 *     }
 * }
 * ```
 */
export interface StorageRegistry {}

/** Storage that uses browser's LocalStorage. Declare key-type pair in StorageRegistry. */
export class Storage<Key extends keyof StorageRegistry, T = StorageRegistry[Key], Input = T> {
	key: Key;
	serde: Serde<T, Input>;
	constructor(key: Key, serde: Serde<T, Input> = new Serde()) {
		this.key = key;
		this.serde = serde;
	}

	exists(): boolean {
		return localStorage.getItem(this.key) !== null;
	}

	clear(): void {
		localStorage.removeItem(this.key);
	}

	get data(): T | null {
		if (!this.exists()) {
			return null;
		}
		return this.serde.deserialize(localStorage.getItem(this.key)!);
	}

	set data(v: Input) {
		const str = this.serde.serialize(v);
		localStorage.setItem(this.key, str);
	}

	save(v: Input): void {
		this.data = v;
	}

	load(): T | null {
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
