import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Task } from '@lit/task';
import { consume } from '@lit/context';
import { SourcefulDivcordTable } from '../data/SourcefulDivcordTableRecord';
import { divcordTableContext } from '../context';

import '../elements/e-card-with-divcord-records';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { type DivcordServiceState, divcordService } from '../DivcordService';

declare global {
	interface HTMLElementTagNameMap {
		'p-divcord': DivcordTablePage;
	}
}

@customElement('p-divcord')
export class DivcordTablePage extends LitElement {
	@consume({ context: divcordTableContext, subscribe: true })
	divcordTable!: SourcefulDivcordTable;

	@query('e-divcord-records-age') ageEl!: DivcordRecordsAgeElement;

	#onRecordsUpdated() {
		this.ageEl.lastLoaded.run();
	}

	render() {
		return html`<div class="page">
			<div class="load">
				<div class="load_btn-and-status">
					<e-update-divcord-data @records-updated=${this.#onRecordsUpdated}></e-update-divcord-data>
					<e-divcord-records-age> </e-divcord-records-age>
				</div>
				<sl-alert class="load_tip" open>
					<sl-icon slot="icon" name="info-circle"></sl-icon>
					<p>You don't have to load manually, it loads and caches if older than 24h, but you can.</p>
				</sl-alert>
			</div>
			<ul>
				${this.divcordTable
					.cards()
					.slice(0, 5)
					.map(card => {
						return html`<e-card-with-divcord-records
							.card=${card}
							.records=${this.divcordTable.recordsByCard(card)}
						></e-card-with-divcord-records>`;
					})}
			</ul>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
			font-family: 'Geist';
		}

		.page {
			padding: 2rem;
			font-size: 14px;
		}

		.load_btn-and-status {
			display: flex;
			align-items: center;
			padding: 1rem;
			gap: 1rem;
		}

		.load_tip {
			display: block;
			max-width: 450px;
		}

		@media (max-width: 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}

			e-card-with-divcord-records::part(card) {
				width: fit-content;
				margin-inline: auto;
			}
		}

		ul {
			display: flex;
			flex-direction: column;
			gap: 3rem;
			margin-top: 2rem;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-relative-time': RelativeTimeElement;
	}
}

@customElement('e-relative-time')
export class RelativeTimeElement extends LitElement {
	#fmt = new Intl.RelativeTimeFormat('en');

	@property({ type: Object }) date!: Date;
	@property() unit?: 'seconds' | 'minutes';

	minutes() {
		return (Date.now() - this.date.getTime()) / 60 / 1000;
	}

	seconds() {
		return Math.floor((Date.now() - this.date.getTime()) / 1000);
	}

	minutesRelativeString() {
		const minutes = this.minutes();
		if (minutes >= 1) {
			return this.#fmt.format(-1 * Math.floor(minutes), 'minutes');
		} else {
			return minutes < 0.2 ? 'now' : 'less than minute ago';
		}
	}

	secondsRelativeString() {
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

	render() {
		if (this.unit === 'seconds') {
			return this.secondsRelativeString();
		}

		return this.minutesRelativeString();
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		:host {
			display: inline;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-records-age': DivcordRecordsAgeElement;
	}
}

@customElement('e-divcord-records-age')
export class DivcordRecordsAgeElement extends LitElement {
	@property({ type: Object }) date?: Date;

	constructor() {
		super();
		divcordService.addEventListener('state-updated', () => {
			if (divcordService.state === 'updated') {
				this.lastLoaded.run();
			}
		});
	}

	lastLoaded = new Task(this, {
		async task() {
			return await divcordService.cacheDate();
		},
		args: () => [],
	});

	render() {
		return this.lastLoaded.render({
			complete: date => {
				if (date === null) {
					return nothing;
				}

				return html`<p>Last loaded: <e-relative-time .date=${date}></e-relative-time> <slot></slot></p> `;
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
		'e-update-divcord-data': UpdateDivcordDataElement;
	}
}

@customElement('e-update-divcord-data')
export class UpdateDivcordDataElement extends LitElement {
	@state() loaderState!: DivcordServiceState;

	constructor() {
		super();
		this.loaderState = divcordService.state;
		divcordService.addEventListener('state-updated', () => {
			this.loaderState = divcordService.state;
		});
	}

	task = new Task<never, void>(this, {
		task: async () => {
			const records = await divcordService.update();
			const event = new CustomEvent('records-updated', { detail: records, bubbles: true, composed: true });
			this.dispatchEvent(event);
		},
	});

	protected loadBtn() {
		return html`<sl-button .loading=${this.loaderState === 'updating'} @click=${this.task.run.bind(this.task)}>
			<p class="reload">Load divcord data</p>
		</sl-button>`;
	}

	render() {
		const t = this.task.render({
			initial: () => this.loadBtn(),
			pending: () => html`<sl-button class="sl-theme-dark" loading>Loading</sl-button>`,
			complete: () => {
				const btn = this.loadBtn();
				return btn;
			},
		});

		return t;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		sl-button {
			font: inherit;
			font-family: 'geist';
		}

		sl-button::part(button) {
			display: none;
		}

		.reload {
			font-family: 'geist';
		}
	`;
}
