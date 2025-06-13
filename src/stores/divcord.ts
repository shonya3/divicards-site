import init_divcord_wasm from '../../gen/divcordWasm/divcord_wasm.js';
await init_divcord_wasm();

import { effect } from 'signal-utils/subtle/microtask-effect';
import { computed, signal } from '@lit-labs/signals';
import { DivcordRecord } from '../../gen/divcord.js';
import { use_local_storage } from '../composables/use_local_storage.js';
import { DivcordTable } from '../DivcordTable.js';
import { fetch_divcord_records } from '../../gen/divcordWasm/divcord_wasm.js';
import { sort_by_weight } from '../cards.js';
import { sortAllSourcesByLevel } from '../utils.js';
import { poeData } from '../PoeData.js';
import { toast, warningToast } from '../toast.js';

declare module '../storage' {
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

function create_divcord_store() {
	const records = signal<Array<DivcordRecord>>([]);
	const state = signal<State>('idle');
	const storage = use_local_storage('divcord', null);
	const table = computed(() => new DivcordTable(records.get()));
	const last_updated_date = computed(() => {
		const stored = storage.get();
		if (!stored) {
			return null;
		}

		return new Date(stored.last_updated);
	});
	const last_updated_age = computed(() => {
		const date = last_updated_date.get();
		if (!date) {
			return null;
		}

		return Date.now() - date.getTime();
	});
	const validity = computed<CacheValidity>(() => {
		const s = storage.get();
		if (!s) {
			return 'not exist';
		}

		if (s.app_version !== import.meta.env.PACKAGE_VERSION) {
			return 'stale';
		}

		const millis = last_updated_age.get();
		if (millis === null) {
			return 'not exist';
		}

		return millis < ONE_DAY_MILLISECONDS ? 'valid' : 'stale';
	});

	async function freshest_records_available() {
		switch (validity.get()) {
			case 'valid': {
				return storage.get()!.records;
			}
			case 'stale': {
				return storage.get()!.records;
			}
			case 'not exist': {
				return (await import('../../gen/divcord.js')).prepared_records;
			}
		}
	}

	async function update() {
		try {
			state.set('updating');
			const recs = await fetch_divcord_records(poeData, warningToast);
			records.set(recs);
			sort_by_weight(recs, poeData);
			sortAllSourcesByLevel(recs, poeData);
			storage.set({
				app_version: import.meta.env.PACKAGE_VERSION,
				records: recs,
				last_updated: new Date().toUTCString(),
			});
			state.set('updated');
		} catch (err) {
			console.log(err);
			state.set('error');
			records.set(await freshest_records_available());
		}
	}

	effect(() => {
		const val = validity.get();
		if (val === 'stale' || val === 'not exist') {
			update();
		}
	});

	effect(() => {
		if (state.get() === 'updated') {
			toast('Your Divcord data is up-to-date', 'success', 3000);
		}
	});

	async function init_records() {
		records.set(await freshest_records_available());
	}
	init_records();

	return {
		records,
		state,
		last_updated_age,
		update,
		table,
		last_updated_date,
	};
}

export const divcord_store = create_divcord_store();
