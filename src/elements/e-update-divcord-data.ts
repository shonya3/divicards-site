import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { divcordLoader, type State } from '../DivcordLoader';
import { Task } from '@lit/task';
import '@shoelace-style/shoelace/dist/components/button/button.js';

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

	protected loadBtn(): TemplateResult {
		return html`<sl-button .loading=${this.loaderState === 'updating'} @click=${this.task.run.bind(this.task)}>
			<p class="reload">Load divcord data</p>
		</sl-button>`;
	}

	render(): TemplateResult | undefined {
		return this.task.render({
			initial: () => this.loadBtn(),
			pending: () => html`<sl-button class="sl-theme-dark" loading>Loading</sl-button>`,
			complete: () => this.loadBtn(),
		});
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
