import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('e-divcord-record-notes')
export class DivcordRecordNotesElement extends LitElement {
	@property() notes?: string;

	protected render(): TemplateResult | null {
		if (!this.notes) {
			return null;
		}

		const notes = this.notes.split('\n').filter(s => s.length > 0);

		return html`<sl-details summary="Notes" class="notes-details">
			<ul>
				${notes.map(note => html`<li>${note}</li>`)}
			</ul>
		</sl-details>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			display: block;
			max-width: 65ch;
		}

		.notes-details {
			margin-top: var(--sl-spacing-large);
		}

		.notes-details::part(base) {
			border: 1px solid var(--sl-color-neutral-200);
			border-radius: var(--sl-border-radius-medium);
		}

		.notes-details::part(header) {
			padding: var(--sl-spacing-small) var(--sl-spacing-medium);
			background-color: var(--sl-color-neutral-50);
			font-weight: var(--sl-font-weight-semibold);
		}

		.notes-details::part(content) {
			padding: var(--sl-spacing-medium);
		}

		.notes-details ul {
			margin: 0;
			padding-left: var(--sl-spacing-large);
		}

		.notes-details li:not(:last-child) {
			margin-bottom: var(--sl-spacing-x-small);
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-record-notes': DivcordRecordNotesElement;
	}
}
