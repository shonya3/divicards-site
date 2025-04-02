import { poeData } from '../../PoeData.js';
import { warningToast } from '../../toast.js';
import { sort_by_weight } from '../../cards.js';
import type { DivcordRecord } from '../../gen/divcord.js';
import { Storage } from '../../storage.js';
import { EventEmitter, sortAllSourcesByLevel } from '../../utils.js';
import init, { fetch_spreadsheet } from '../../gen/divcordWasm/divcord_wasm.js';

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

type WorkerMessage = { type: 'records'; data: Array<DivcordRecord> } | { type: 'ParseError'; data: string };

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
		const promise = new Promise<Array<DivcordRecord>>(async resolve => {
			const worker = new Worker(new URL('./worker.ts', import.meta.url), {
				type: 'module',
			});
			worker.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
				const message = e.data;
				switch (message.type) {
					case 'ParseError': {
						warningToast(message.data);
						break;
					}
					case 'records': {
						resolve(message.data);
						break;
					}
				}
			});

			this.#setState('updating');
			const spreadsheet = await fetch_spreadsheet();
			worker.postMessage({ spreadsheet, poeData });
		});

		try {
			const records = await promise;
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
