import { LitElement, PropertyValueMap, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import { router } from '../router';

declare global {
	interface HTMLElementTagNameMap {
		'e-page-controls': PageControlsElement;
	}
}

@customElement('e-page-controls')
export class PageControlsElement extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ type: Number }) n: number = 0;

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

	lastPageNumber() {
		return Math.ceil(this.n / this.perPage);
	}

	toLastPage() {
		this.page = this.lastPageNumber();
	}

	showingRange(): [number, number] | null {
		const start = (this.page - 1) * this.perPage;
		let end = start + this.perPage;
		if (start + 1 <= 0 || end <= 0) {
			return null;
		}
		if (end > this.n) {
			end = this.n;
		}
		return [start + 1, end];
	}

	get isLastPage() {
		return this.page === this.lastPageNumber();
	}

	decreasePage() {
		if (this.page > 1) {
			this.page--;
		}
	}

	render() {
		const range = this.showingRange();
		return html`
			<div class="page-controls">
				<div class="buttons">
					<sl-icon-button name="chevron-left" ?disabled=${this.page === 1} @click=${this.decreasePage}
						>prev</sl-icon-button
					>
					<sl-input
						class="page-input"
						.helpText=${'page'}
						id="page"
						type="number"
						.value=${String(this.page)}
						@input=${this.#onPageInput}
						min="1"
					></sl-input>
					<sl-icon-button .disabled=${this.isLastPage} name="chevron-right" @click=${this.increasePage}
						>next</sl-icon-button
					>
					<sl-icon-button .disabled=${this.isLastPage} name="chevron-double-right" @click=${this.toLastPage}
						>next</sl-icon-button
					>
					<sl-input
						class="per-page-input"
						.helpText=${'per page'}
						id="per-page"
						type="number"
						min="1"
						.value=${String(this.perPage)}
						@input=${this.#onPerPageInput}
					></sl-input>
				</div>
				${range !== null && this.n > 0 ? html` <p>${range[0]} - ${range[1]} of ${this.n}</p> ` : nothing}
			</div>
		`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		.page-controls {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 1rem;
		}

		.buttons {
			display: flex;
			gap: 0.4rem;
			align-items: center;
		}

		@media (max-width: 600px) {
			.buttons {
				gap: 0rem;
			}
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

// <sl-button circle>44</sl-button>;
