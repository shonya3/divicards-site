import { LitElement, html, css, nothing, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import { router } from '../router';

@customElement('e-pagination')
export class PageControlsElement extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number }) per_page = 10;
	@property({ type: Number }) n: number = 0;

	attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
		super.attributeChangedCallback(name, _old, value);

		if (name === 'page' || name === 'per_page') {
			const skip = _old === value || _old == null;

			if (!skip) {
				const url = new URL(window.location.href);
				if (name === 'page') {
					url.searchParams.set('page', String(this.page));
				}
				if (name === 'per_page') {
					url.searchParams.set('per_page', String(this.per_page));
				}

				router.skip_transition = true;
				router.navigate(url);
			}
		}
	}

	protected render(): TemplateResult {
		const range = this.active_items_range();
		return html`
			<div class="page-controls">
				<div class="buttons">
					<sl-icon-button
						aria-label="prev"
						name="chevron-left"
						?disabled=${this.page === 1}
						@click=${this.decrease_page}
						>prev</sl-icon-button
					>
					<sl-input
						class="page-input"
						.helpText=${'page'}
						id="page"
						type="number"
						.value=${String(this.page)}
						@input=${this.#h_page_input}
						min="1"
					></sl-input>
					<sl-icon-button
						aria-label="next"
						.disabled=${this.is_last_page}
						name="chevron-right"
						@click=${this.increase_page}
						>next</sl-icon-button
					>
					<sl-icon-button
						.disabled=${this.is_last_page}
						name="chevron-double-right"
						@click=${this.to_last_page}
						>next</sl-icon-button
					>
					<sl-input
						aria-label="to last page"
						class="per_page-input"
						.helpText=${'per page'}
						id="per_page"
						type="number"
						min="1"
						.value=${String(this.per_page)}
						@input=${this.#h_per_page_input}
					></sl-input>
				</div>
				<span class="current-items-label"
					>${range !== null && this.n > 0
						? html` <p>${range[0]} - ${range[1]} of ${this.n}</p> `
						: nothing}</span
				>
			</div>
		`;
	}

	#h_page_input(e: InputEvent) {
		const target = e.composedPath()[0] as HTMLInputElement;
		this.page = Number(target.value);
	}
	#h_per_page_input(e: InputEvent) {
		const target = e.composedPath()[0] as HTMLInputElement;
		this.per_page = Number(target.value);
	}

	increase_page(): void {
		this.page++;
	}
	decrease_page(): void {
		this.page > 1 && this.page--;
	}

	last_page_number(): number {
		return Math.ceil(this.n / this.per_page);
	}
	to_last_page(): void {
		this.page = this.last_page_number();
	}
	get is_last_page(): boolean {
		return this.page === this.last_page_number();
	}

	active_items_range(): [number, number] | null {
		const start = (this.page - 1) * this.per_page;
		let end = start + this.per_page;
		if (start + 1 <= 0 || end <= 0) {
			return null;
		}
		if (end > this.n) {
			end = this.n;
		}
		return [start + 1, end];
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
			@media (width >= 640px) {
				gap: 1rem;
			}
		}

		.buttons {
			display: flex;
			gap: 0.4rem;
			align-items: center;
		}

		sl-icon-button {
			font-size: 1.2rem;
		}

		.per_page-input,
		.page-input {
			margin-top: 1.1rem;
			width: 8ch;
		}

		.current-items-label {
			color: var(--sl-color-gray-600);
			font-size: 0.85rem;
			padding-left: 1rem;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-pagination': PageControlsElement;
	}
}
