import { poeData } from '../../PoeData.js';
import { sort_by_weight } from '../../cards.js';
import type { DivcordRecord } from '../../gen/divcord.js';
import { Storage } from '../../storage.js';
import { EventEmitter, sortAllSourcesByLevel } from '../../utils.js';
import init, { fetch_divcord_records } from '../../gen/divcordWasm/divcord_wasm.js';
import { warningToast } from '../../toast.js';

await init();

declare module '../../storage' {
	interface Registry {
		divcord: {
			app_version: string;
			last_updated: string;
			records: Array<DivcordRecord>;
		} | null;
	}
}

const ONE_DAY_MILLISECONDS = 86_400_000;

export type CacheValidity = 'valid' | 'stale' | 'not exist';
export type State = 'idle' | 'updating' | 'updated' | 'error';

export class DivcordLoader extends EventEmitter<{
	'state-updated': State;
	'records-updated': Array<DivcordRecord>;
}> {
	#state: State = 'idle';
	#storage = new Storage('divcord', null);

	get state(): State {
		return this.#state;
	}

	#setState(val: State): void {
		this.#state = val;
		this.emit('state-updated', val);
	}

	async get_records_and_start_update_if_needed(): Promise<Array<DivcordRecord>> {
		const validity = this.#check_validity();
		if (validity === 'stale' || validity === 'not exist') {
			this.update();
		}

		return await this.#freshest_available_records(validity);
	}

	async update(): Promise<Array<DivcordRecord>> {
		try {
			const records = await fetch_divcord_records(JSON.stringify(poeData), warningToast);
			sort_by_weight(records, poeData);
			sortAllSourcesByLevel(records, poeData);
			this.#storage.save({
				app_version: import.meta.env.PACKAGE_VERSION,
				records,
				last_updated: new Date().toUTCString(),
			});
			this.#setState('updated');
			this.emit('records-updated', records);
			return records;
		} catch (err) {
			console.log(err);
			this.#setState('error');
			const records = await this.#freshest_available_records();
			return records;
		}
	}

	last_updated_date(): Date | null {
		const stored = this.#storage.data;
		if (!stored) {
			return null;
		}

		return new Date(stored.last_updated);
	}

	last_updated_age(): number | null {
		const date = this.last_updated_date();
		if (!date) {
			return null;
		}

		return Date.now() - date.getTime();
	}

	#check_validity(): CacheValidity {
		if (!this.#storage.data) {
			return 'not exist';
		}

		if (this.#storage.data.app_version !== import.meta.env.PACKAGE_VERSION) {
			return 'stale';
		}

		const millis = this.last_updated_age();
		if (millis === null) {
			return 'not exist';
		}

		return millis < ONE_DAY_MILLISECONDS ? 'valid' : 'stale';
	}

	async #freshest_available_records(validity?: CacheValidity) {
		const val = validity ? validity : this.#check_validity();

		switch (val) {
			case 'valid': {
				return this.#storage.load()!.records;
			}
			case 'stale': {
				return this.#storage.load()!.records;
			}
			case 'not exist': {
				return (await import('../../gen/divcord.js')).prepared_records;
			}
		}
	}
}

export const divcordLoader = new DivcordLoader();
