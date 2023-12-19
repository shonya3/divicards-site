import { LitElement, css, html } from 'lit';
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

	// protected render1() {
	// 	return html`<div class="c-mbox c-mbox--info">
	// 		<div class="c-mbox__image">
	// 			<img src="/images/45px-Divcord.png" decoding="async" width="45" height="45" />
	// 		</div>
	// 		<div class="c-mbox__main">
	// 			<div class="c-mbox__title">
	// 				<p>Divcord has no confirmed drop sources.</p>
	// 			</div>
	// 			<div class="c-mbox__text">
	// 				<p>
	// 					If you find one that did not come from sources of random divination cards—including Stacked
	// 					Decks and divination card rewards—consider posting a screenshot to the
	// 					<a rel="nofollow" class="external text" href="https://discord.gg/jsN2gsDUyM"
	// 						>Divination Card Discord🧷</a
	// 					>, also known as <a class="mw-selflink selflink">Divcord</a>.
	// 				</p>
	// 			</div>
	// 		</div>
	// 	</div>`;
	// }

	protected render() {
		return html`<div class="element">
			<sl-alert open>
				<img slot="icon" src="/images/45px-Divcord.png" decoding="async" width="45" height="45" />
				<h3 class="title">${this.card} has no confirmed drop sources.</h3>
				If you find one that did not come from sources of random divination cards — including Stacked Decks and
				divination card rewards — consider posting a screenshot to the
				<a href="https://discord.com/invite/jsN2gsDUyM" target="_blank"
					>Divination Card Discord🧷, also known as Divcord.</a
				>
			</sl-alert>
		</div>`;
	}

	static styles = css`
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
