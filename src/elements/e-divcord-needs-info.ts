import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-needs-info': DivcordNeedsInfoElement;
	}
}

@customElement('e-divcord-needs-info')
export class DivcordNeedsInfoElement extends LitElement {
	@property({ reflect: true }) card: string = '';

	protected render(): TemplateResult {
		return html`<div class="element">
			<sl-alert open>
				<img slot="icon" src="/images/45px-Divcord.png" decoding="async" width="45" height="45" />
				<h3 class="title">${this.card} has no confirmed drop sources.</h3>
				If you find one, consider posting a screenshot to the
				<p>
					<a href="https://discord.com/invite/jsN2gsDUyM" target="_blank"
						>Divination Card Discord🧷, also known as Divcord.</a
					>
				</p>
				<p>
					<em>DON'T</em> include cards obtained from random divination card sources like Stacked Decks or
					divination card rewards.
				</p>
			</sl-alert>
		</div>`;
	}

	static styles = css`
		:host {
			display: block;
		}

		* {
			padding: 0;
			margin: 0;
			font-family: Geist;
		}

		a,
		a:visited {
			color: var(--source-color, #bbbbbb);
		}

		a:hover {
			color: var(--link-color-hover);
		}

		.element {
			max-width: 600px;
		}

		sl-alert {
			font-family: Geist;
		}
	`;
}
