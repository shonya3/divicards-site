import { computed } from '@lit-labs/signals';
import { effect } from 'signal-utils/subtle/microtask-effect';
import { use_local_storage } from '../composables/use_local_storage';

declare module '../storage' {
	interface Registry {
		counter: number;
	}
}

export function create_counter_store() {
	const counter = use_local_storage('counter', 0);
	const double = computed(() => counter.get() * 2);
	function increment(step = 1) {
		counter.set(counter.get() + step);
	}
	function decrement(step = 1) {
		counter.set(counter.get() - step);
	}

	effect(() => {
		console.log(`New counter value: ${counter.get()}`);
	});

	return { counter, double, increment, decrement };
}

export const counter_store = create_counter_store();
