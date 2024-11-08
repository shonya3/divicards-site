import { signal } from '@lit-labs/signals';
import { effect } from 'signal-utils/subtle/microtask-effect';
import { Registry } from '../storage';

export function use_local_storage<Key extends keyof Registry>(storage_key: Key, default_value: Registry[Key]) {
	const from_storage = localStorage.getItem(storage_key);

	let value: Registry[Key];
	if (from_storage === null) {
		value = default_value;
	} else {
		try {
			value = JSON.parse(from_storage);
		} catch (err) {
			value = default_value;
		}
	}

	const _signal = signal(value);

	effect(() => {
		localStorage.setItem(storage_key, JSON.stringify(_signal.get()));
	});

	return _signal;
}
