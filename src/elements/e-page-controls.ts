import { LitElement, PropertyValueMap, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { router } from '../main';

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
			window.history.pushState({}, '', url);
		}
		if (_changedProperties.has('perPage')) {
			url.searchParams.set('per-page', String(this.perPage));
			window.history.pushState({}, '', url);
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
				<button ?disabled=${this.page === 1} @click=${this.decreasePage}>prev</button>
				<input id="page" type="text" .value=${String(this.page)} @input=${this.#onPageInput} />
				<button @click=${this.increasePage}>next</button>
				<label for="per-page">per page</label>
				<input
					id="per-page"
					type="number"
					min="0"
					.value=${String(this.perPage)}
					@input=${this.#onPerPageInput}
				/>
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
	`;
}
