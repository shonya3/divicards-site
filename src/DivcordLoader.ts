import { PoeData, poeData } from './PoeData';
import { warningToast } from './toast';
import { sortByWeight } from './cards';
import type { DivcordRecord } from './gen/divcord';
import { Storage } from './storage';
import { EventEmitter } from './utils';

declare module './storage' {
	interface Registry {
		divcord: DivcordRecord[];
	}
}

const ONE_DAY_MILLISECONDS = 86_400_000;
const CACHE_KEY = import.meta.env.PACKAGE_VERSION;

export type CacheValidity = 'valid' | 'stale' | 'not exist';
export type State = 'idle' | 'updating' | 'updated' | 'error';

export class DivcordLoader extends EventEmitter<{
	'state-updated': State;
	'records-updated': DivcordRecord[];
}> {
	#state: State = 'idle';
	#cache: Cache;
	#storage = new Storage('divcord', []);
	constructor(cache: Cache) {
		super();
		this.#cache = cache;
	}

	get state() {
		return this.#state;
	}

	#setState(val: State) {
		this.#state = val;
		this.emit('state-updated', val);
	}

	async getRecordsAndRunUpdateIfNeeded(): Promise<DivcordRecord[]> {
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

	async update(): Promise<DivcordRecord[]> {
		try {
			this.#setState('updating');
			await Promise.all([
				this.#cache.add(richSourcesUrl('sources')),
				this.#cache.add(sheetUrl()),
				this.#cache.add(richSourcesUrl('verify')),
			]);
			const resp = await this.#cachedResponses();
			const spreadsheet = await this.#deserializeResponses(resp!);
			const records = await parseRecords(spreadsheet, poeData);
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
		const richSources = await this.#cache.match(richSourcesUrl('sources'));
		const richVerify = await this.#cache.match(richSourcesUrl('verify'));
		const sheet = await this.#cache.match(sheetUrl());
		if (!richSources || !sheet || !richVerify) return null;
		return {
			richVerify,
			richSources,
			sheet,
		};
	}

	async #deserializeResponses(cached: CachedResponses): Promise<Spreadsheet> {
		const [rich_sources_column, sheet, rich_verify_column] = await Promise.all([
			cached.richSources.json(),
			cached.sheet.json(),
			cached.richVerify.json(),
		]);
		return { rich_sources_column, sheet, rich_verify_column };
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
	rich_sources_column: object;
	rich_verify_column: object;
};

function sheetUrl(): string {
	const key = 'AIzaSyBVoDF_twBBT_MEV5nfNgekVHUSn9xodfg';
	const spreadsheet_id = '1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU';
	const sheet = 'Cards_and_Hypotheses';
	const range = `${sheet}!A3:Z`;
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}?key=${key}`;
	return url;
}

function richSourcesUrl(richColumnVariant: 'sources' | 'verify'): string {
	const column = richColumnVariant === 'sources' ? 'F' : 'H';
	const key = 'AIzaSyBVoDF_twBBT_MEV5nfNgekVHUSn9xodfg';
	const spreadsheet_id = '1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU';
	const sheet = 'Cards_and_Hypotheses';
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}?&ranges=${sheet}!${column}3:${column}&includeGridData=true&key=${key}`;
	return url;
}

async function parseRecords(divcord: Spreadsheet, poeData: PoeData): Promise<DivcordRecord[]> {
	const { default: initWasm, parsed_records } = await import('./gen/divcordWasm/divcord_wasm.js');
	await initWasm();
	const records = parsed_records(JSON.stringify(divcord), JSON.stringify(poeData), warningToast) as DivcordRecord[];
	sortByWeight(records, poeData);
	return records;
}

const cache = await caches.open(CACHE_KEY);
export const divcordLoader = new DivcordLoader(cache);
