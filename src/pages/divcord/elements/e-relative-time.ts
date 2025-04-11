import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('e-relative-time')
export class RelativeTimeElement extends LitElement {
	#fmt = new Intl.RelativeTimeFormat('en');

	@property({ type: Object }) date!: Date;
	@property() unit?: 'seconds' | 'minutes';

	minutes(): number {
		return (Date.now() - this.date.getTime()) / 60 / 1000;
	}

	seconds(): number {
		return Math.floor((Date.now() - this.date.getTime()) / 1000);
	}

	minutesRelativeString(): string {
		const minutes = this.minutes();
		if (minutes >= 1) {
			return this.#fmt.format(-1 * Math.floor(minutes), 'minutes');
		} else {
			return minutes < 0.2 ? 'now' : 'less than minute ago';
		}
	}

	secondsRelativeString(): string {
		const seconds = this.seconds();
		if (seconds >= 1) {
			return this.#fmt.format(-1 * seconds, 'seconds');
		} else {
			return 'now';
		}
	}

	connectedCallback(): void {
		super.connectedCallback();
		setInterval(() => {
			this.requestUpdate();
		}, 1000);
	}

	render(): string {
		if (this.unit === 'seconds') {
			return this.secondsRelativeString();
		}

		return this.minutesRelativeString();
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'e-relative-time': RelativeTimeElement;
	}
}
