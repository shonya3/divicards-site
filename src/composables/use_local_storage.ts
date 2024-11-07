import { signal } from '@lit-labs/signals';
import { effect } from 'signal-utils/subtle/microtask-effect';
import { Registry } from '../storage';

export function use_local_storage<Key extends keyof Registry>(storage_key: Key, default_value: Registry[Key]) {
	const from_storage = localStorage.getItem(storage_key);
	const value: Registry[Key] = from_storage === null ? default_value : JSON.parse(from_storage);

	const signal_value = signal(value);

	effect(() => {
		localStorage.setItem(storage_key, JSON.stringify(signal_value.get()));
	});

	return signal_value;
}
