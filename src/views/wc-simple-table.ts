import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'wc-simple-table': SimpleTableElement;
	}
}

@customElement('wc-simple-table')
export class SimpleTableElement extends LitElement {
	@property({ type: Array }) entries!: [any, any][];

	// render() {
	// 	console.log('render');
	// 	return html`
	// 		<ul>
	// 			${this.entries.map(
	// 				([firstColumn, secondColumn]) =>
	// 					html`
	// 						<slot .firstColumn=${firstColumn} name="first">1</slot
	// 						><slot .secondColumn=${secondColumn} name="second-column">2</slot>
	// 					`
	// 			)}
	// 		</ul>
	// 	`;
	// }

	render() {
		return html` <slot name="first">first</slot> <slot name="second">second</slot> `;
	}
}
