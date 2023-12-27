import type { ISourcefulDivcordTableRecord } from './divcord.js';
import { SourcefulDivcordTableRecord } from './divcord.js';
import { PoeData, poeData } from './PoeData';
import { LocalStorageManager, Serde } from './storage';
import { warningToast } from './toast.js';
import { sortByWeight } from './CardsFinder.js';

export interface DivcordResponses {
	rich: Response;
	sheet: Response;
}

export interface IDivcordData {
	sheet: object;
	rich_sources_column: object;
}

const ONE_DAY_MILLISECONDS = 86_400_000;
const CACHE_KEY = import.meta.env.PACKAGE_VERSION;
const LOCAL_STORAGE_KEY = 'divcord';

export type CacheValidity = 'valid' | 'stale' | 'not exist';
export type DivcordServiceEventType = 'state-updated';
export type DivcordServiceState = 'idle' | 'updating' | 'updated' | 'error';

export class DivcordServiceEvent extends Event {
	constructor(type: DivcordServiceEventType) {
		super(type);
	}
}

export class DivcordService extends EventTarget {
	#state: DivcordServiceState = 'idle';
	#cache: Cache;
	localStorageManager: DivcordLocalStorageManager;
	constructor(cache: Cache) {
		super();
		this.#cache = cache;
		this.localStorageManager = new DivcordLocalStorageManager();
	}

	addEventListener(type: DivcordServiceEventType, callback: (e: DivcordServiceEvent) => void): void {
		super.addEventListener(type, callback);
	}

	get state() {
		return this.#state;
	}

	set state(val: DivcordServiceState) {
		this.#state = val;
		this.dispatchEvent(new DivcordServiceEvent('state-updated'));
	}

	async read(): Promise<SourcefulDivcordTableRecord[]> {
		const validity = await this.checkValidity();
		switch (validity) {
			case 'valid': {
				return this.localStorageManager.load()!;
			}
			case 'stale': {
				this.update();
				return this.localStorageManager.load()!;
			}
			case 'not exist': {
				this.update();
				return await this.#fromStaticJson();
			}
		}
	}

	async bestAvailableRecords() {
		const validity = await this.checkValidity();
		switch (validity) {
			case 'valid': {
				return this.localStorageManager.load()!;
			}
			case 'stale': {
				return this.localStorageManager.load()!;
			}
			case 'not exist': {
				return await this.#fromStaticJson();
			}
		}
	}

	async update(): Promise<SourcefulDivcordTableRecord[]> {
		try {
			this.state = 'updating';
			await Promise.all([this.#cache.add(richUrl()), this.#cache.add(sheetUrl())]);
			const resp = await this.#cachedResponses();
			const divcordData = await this.#serderesponses(resp!);
			const records = await parseRecords(divcordData, poeData);
			this.localStorageManager.save(records);
			this.state = 'updated';
			return records;
		} catch (err) {
			console.log(err);
			this.state = 'error';
			const records = await this.bestAvailableRecords();
			return records;
		}
	}

	async cacheDate(): Promise<Date | null> {
		const resp = await this.#cachedResponses();
		if (!resp) {
			return null;
		}

		return new Date(resp.rich.headers.get('date')!);
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
		if (millis === null || !this.localStorageManager.exists()) {
			return 'not exist';
		}

		return millis < ONE_DAY_MILLISECONDS ? 'valid' : 'stale';
	}

	async #cachedResponses(): Promise<DivcordResponses | null> {
		const rich = await this.#cache.match(richUrl());
		const sheet = await this.#cache.match(sheetUrl());
		if (!rich || !sheet) return null;
		return {
			rich,
			sheet,
		};
	}

	async #serderesponses(r: DivcordResponses): Promise<IDivcordData> {
		const [rich_sources_column, sheet] = await Promise.all([r.rich.json(), r.sheet.json()]);
		return { rich_sources_column, sheet };
	}

	async #fromStaticJson(): Promise<SourcefulDivcordTableRecord[]> {
		const { divcordRecordsFromJson } = await import('./gen/divcordRecordsFromJson.js');
		return divcordRecordsFromJson.map(r => new SourcefulDivcordTableRecord(r));
	}
}

class DivcordSerde extends Serde<
	SourcefulDivcordTableRecord[],
	SourcefulDivcordTableRecord[] | ISourcefulDivcordTableRecord[]
> {
	serialize(value: SourcefulDivcordTableRecord[] | ISourcefulDivcordTableRecord[]): string {
		return super.serialize(value);
	}

	deserialize(s: string): SourcefulDivcordTableRecord[] {
		const iRecords = super.deserialize(s) as ISourcefulDivcordTableRecord[];
		return iRecords.map(r => new SourcefulDivcordTableRecord(r));
	}
}

export class DivcordLocalStorageManager extends LocalStorageManager<
	SourcefulDivcordTableRecord[],
	typeof LOCAL_STORAGE_KEY,
	SourcefulDivcordTableRecord[] | ISourcefulDivcordTableRecord[]
> {
	constructor() {
		super(LOCAL_STORAGE_KEY, new DivcordSerde());
	}
}

function sheetUrl(): string {
	const key = 'AIzaSyBVoDF_twBBT_MEV5nfNgekVHUSn9xodfg';
	const spreadsheet_id = '1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU';
	const sheet = 'Cards_and_Hypotheses';
	const range = `${sheet}!A3:Z`;
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}?key=${key}`;
	return url;
}

function richUrl(): string {
	const key = 'AIzaSyBVoDF_twBBT_MEV5nfNgekVHUSn9xodfg';
	const spreadsheet_id = '1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU';
	const sheet = 'Cards_and_Hypotheses';
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}?&ranges=${sheet}!F3:F&includeGridData=true&key=${key}`;
	return url;
}

export async function parseRecords(divcord: IDivcordData, poeData: PoeData): Promise<SourcefulDivcordTableRecord[]> {
	const { default: initWasm, parsed_records } = await import('./gen/divcordWasm/divcord_wasm.js');
	await initWasm();
	const records = parsed_records(
		JSON.stringify(divcord),
		JSON.stringify(poeData),
		warningToast
	) as ISourcefulDivcordTableRecord[];
	sortByWeight(records, poeData);
	return records.map(r => new SourcefulDivcordTableRecord(r));
}

const cache = await caches.open(CACHE_KEY);
export const divcordService = new DivcordService(cache);
