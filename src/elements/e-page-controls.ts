import { LitElement, PropertyValueMap, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { router } from '../main';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';

declare global {
	interface HTMLElementTagNameMap {
		'e-page-controls': PageControlsElement;
	}
}

@customElement('e-page-controls')
export class PageControlsElement extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;

	protected willUpdate(_changedProperties: PropertyValueMap<this>): void {
		const url = new URL(window.location.href);
		if (_changedProperties.has('page')) {
			url.searchParams.set('page', String(this.page));
		}
		if (_changedProperties.has('perPage')) {
			url.searchParams.set('per-page', String(this.perPage));
		}

		router.navigate(url);
	}

	#onPageInput(e: InputEvent) {
		const target = e.composedPath()[0] as HTMLInputElement;
		this.page = Number(target.value);
	}
	#onPerPageInput(e: InputEvent) {
		const target = e.composedPath()[0] as HTMLInputElement;
		this.perPage = Number(target.value);
	}
	increasePage() {
		this.page++;
	}

	decreasePage() {
		if (this.page > 1) {
			this.page--;
		}
	}

	render() {
		return html`
			<div class="page-controls">
				<sl-icon-button name="arrow-left" ?disabled=${this.page === 1} @click=${this.decreasePage}
					>prev</sl-icon-button
				>
				<sl-input
					class="page-input"
					.helpText=${'page'}
					id="page"
					type="number"
					.value=${String(this.page)}
					@input=${this.#onPageInput}
				></sl-input>
				<sl-icon-button name="arrow-right" @click=${this.increasePage}>next</sl-icon-button>
				<sl-input
					class="per-page-input"
					.helpText=${'per page'}
					id="per-page"
					type="number"
					min="0"
					.value=${String(this.perPage)}
					@input=${this.#onPerPageInput}
				></sl-input>
			</div>
		`;
	}

	static styles = css`
		.page-controls {
			display: flex;
			gap: 0.4rem;
			align-items: center;
		}

		.page-controls > input {
			width: 5ch;
			text-align: center;
		}

		sl-icon-button {
			font-size: 1.2rem;
		}

		.per-page-input,
		.page-input {
			margin-top: 1.1rem;
			width: 8ch;
		}
	`;
}
