import { Task } from '@lit/task';
import { LitElement, nothing, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { divcordLoader } from '../DivcordLoader';
import './e-relative-time';

@customElement('e-divcord-records-age')
export class DivcordRecordsAgeElement extends LitElement {
	@property({ type: Object }) date?: Date;

	constructor() {
		super();
		divcordLoader.addEventListener('state-updated', state => {
			if (state === 'updated') {
				this.lastUpdated.run();
			}
		});
	}

	lastUpdated = new Task(this, {
		async task() {
			return await divcordLoader.cacheDate();
		},
		args: () => [],
	});

	render(): TemplateResult | typeof nothing | undefined {
		return this.lastUpdated.render({
			complete: date => {
				if (date === null) {
					return nothing;
				}

				return html`<p>Last updated: <e-relative-time .date=${date}></e-relative-time> <slot></slot></p> `;
			},
		});
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-records-age': DivcordRecordsAgeElement;
	}
}
