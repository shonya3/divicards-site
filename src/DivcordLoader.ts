import { poeData } from './PoeData';
import { warningToast } from './toast';
import { sortByWeight } from './cards';
import type { DivcordRecord } from './gen/divcord';
import { Storage } from './storage';
import { EventEmitter, sortAllSourcesByLevel } from './utils';

declare module './storage' {
	interface Registry {
		divcord: DivcordRecord[];
	}
}

type WorkerMessage = { type: 'records'; data: DivcordRecord[] } | { type: 'ParseError'; data: string };

const ONE_DAY_MILLISECONDS = 86_400_000;
const CACHE_KEY = import.meta.env.PACKAGE_VERSION;

export type CacheValidity = 'valid' | 'stale' | 'not exist';
export type State = 'idle' | 'updating' | 'updated' | 'error';

export class DivcordLoader extends EventEmitter<{
	'state-updated': State;
	'records-updated': DivcordRecord[];
}> {
	#state: State = 'idle';
	#cache: Promise<Cache>;
	#storage = new Storage('divcord', []);
	constructor() {
		super();
		this.#cache = caches.open(CACHE_KEY);
	}

	get state(): State {
		return this.#state;
	}

	#setState(val: State): void {
		this.#state = val;
		this.emit('state-updated', val);
	}

	async getRecordsAndStartUpdateIfNeeded(): Promise<DivcordRecord[]> {
		const validity = await this.checkValidity();
		switch (validity) {
			case 'valid': {
				return this.#storage.load();
			}
			case 'stale': {
				this.update();
				return this.#storage.load();
			}
			case 'not exist': {
				this.update();
				return await this.#fromStaticJson();
			}
		}
	}

	async fetchSpreadsheet(): Promise<Spreadsheet> {
		const cache = await this.#cache;
		await Promise.all([
			cache.add(richSourcesUrl('sources')),
			cache.add(richSourcesUrl('verify')),
			cache.add(sheetUrl()),
		]);
		const cached = await this.#cachedResponses();
		const spreadsheet = await this.#deserializeResponses(cached!);
		return spreadsheet;
	}

	async update(): Promise<DivcordRecord[]> {
		const promise = new Promise<DivcordRecord[]>(async resolve => {
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
			const spreadsheet = await this.fetchSpreadsheet();
			worker.postMessage({ spreadsheet, poeData });
		});

		try {
			const records = await promise;
			sortByWeight(records, poeData);
			sortAllSourcesByLevel(records, poeData);
			this.#storage.save(records);
			this.#setState('updated');
			this.emit('records-updated', records);
			return records;
		} catch (err) {
			console.log(err);
			this.#setState('error');
			const records = await this.#freshestAvailableRecords();
			return records;
		}
	}

	async cacheDate(): Promise<Date | null> {
		const resp = await this.#cachedResponses();
		if (!resp) {
			return null;
		}

		return new Date(resp.richSources.headers.get('date')!);
	}

	async cacheAge(): Promise<number | null> {
		const date = await this.cacheDate();
		if (!date) {
			return null;
		}

		return Date.now() - date.getTime();
	}

	async checkValidity(): Promise<CacheValidity> {
		const millis = await this.cacheAge();
		if (millis === null || !this.#storage.exists()) {
			return 'not exist';
		}

		return millis < ONE_DAY_MILLISECONDS ? 'valid' : 'stale';
	}

	async #freshestAvailableRecords() {
		const validity = await this.checkValidity();
		switch (validity) {
			case 'valid': {
				return this.#storage.load()!;
			}
			case 'stale': {
				return this.#storage.load()!;
			}
			case 'not exist': {
				return await this.#fromStaticJson();
			}
		}
	}

	async #cachedResponses(): Promise<CachedResponses | null> {
		const cache = await this.#cache;
		const richSources = await cache.match(richSourcesUrl('sources'));
		const richVerify = await cache.match(richSourcesUrl('verify'));
		const sheet = await cache.match(sheetUrl());
		if (!richSources || !richVerify || !sheet) return null;
		return {
			richVerify,
			richSources,
			sheet,
		};
	}

	async #deserializeResponses(cached: CachedResponses): Promise<Spreadsheet> {
		const [rich_confirmations_new_325, rich_to_confirm_or_reverify, sheet] = await Promise.all([
			cached.richSources.json(),
			cached.richVerify.json(),
			cached.sheet.json(),
		]);
		return { rich_confirmations_new_325, rich_to_confirm_or_reverify, sheet };
	}

	async #fromStaticJson(): Promise<DivcordRecord[]> {
		const { divcordRecordsFromJson } = await import('./gen/divcord.js');
		return divcordRecordsFromJson;
	}
}

type CachedResponses = {
	richSources: Response;
	richVerify: Response;
	sheet: Response;
};

type Spreadsheet = {
	sheet: object;
	rich_confirmations_new_325: object;
	rich_to_confirm_or_reverify: object;
};

function sheetUrl(): string {
	const key = 'AIzaSyBVoDF_twBBT_MEV5nfNgekVHUSn9xodfg';
	const spreadsheet_id = '1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU';
	const sheet = 'Cards_and_Hypotheses';
	const range = `${sheet}!A3:Z`;
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}?key=${key}`;
	return url;
}

function richSourcesUrl(richColumn: 'sources' | 'verify'): string {
	const column = richColumn === 'sources' ? 'G' : 'H';
	const key = 'AIzaSyBVoDF_twBBT_MEV5nfNgekVHUSn9xodfg';
	const spreadsheet_id = '1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU';
	const sheet = 'Cards_and_Hypotheses';
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}?&ranges=${sheet}!${column}3:${column}&includeGridData=true&key=${key}`;
	return url;
}

export const divcordLoader = new DivcordLoader();
