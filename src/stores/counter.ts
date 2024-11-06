import { computed } from '@lit-labs/signals';
import { effect } from 'signal-utils/subtle/microtask-effect';
import { use_local_storage } from '../composables/use_local_storage';

declare module '../storage' {
	interface Registry {
		counter: number;
	}
}

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

export const store = {
	counter,
	double,
	increment,
	decrement,
};
