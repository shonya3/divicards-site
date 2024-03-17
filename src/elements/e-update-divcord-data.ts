import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { divcordLoader, type State } from '../DivcordLoader';
import { Task } from '@lit/task';

declare global {
	interface HTMLElementTagNameMap {
		'e-update-divcord-data': UpdateDivcordDataElement;
	}
}

@customElement('e-update-divcord-data')
export class UpdateDivcordDataElement extends LitElement {
	@state() loaderState!: State;

	constructor() {
		super();
		this.loaderState = divcordLoader.state;
		divcordLoader.addEventListener('state-updated', state => {
			this.loaderState = state;
		});
	}

	task = new Task<never, void>(this, {
		task: async () => {
			const records = await divcordLoader.update();
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
