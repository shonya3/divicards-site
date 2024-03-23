import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Registry, Serde } from '../storage';
import { Storage } from '../storage';

export class UseStorage<Key extends keyof Registry, Input = Registry[Key]> implements ReactiveController {
	storage: Storage<Key, Input>;
	host: ReactiveControllerHost;

	value(): Registry[Key] {
		return this.storage.data;
	}

	setValue(value: Input | ((val: Registry[Key]) => Input)): void {
		if (typeof value === 'function') {
			const cb = value as (val: Registry[Key]) => Input;
			this.storage.data = cb(this.storage.data);
		} else {
			this.storage.save(value);
		}
		this.host.requestUpdate();
	}

	constructor(
		host: ReactiveControllerHost,
		key: Key,
		defaultValue: Registry[Key],
		serde: Serde<Registry[Key], Input> = new Serde()
	) {
		this.storage = new Storage(key, defaultValue, serde);
		this.host = host;
		this.host.addController(this);
	}

	hostConnected(): void {}
}
