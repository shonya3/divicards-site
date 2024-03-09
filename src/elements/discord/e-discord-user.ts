import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import './e-discord-avatar';

declare global {
	interface HTMLElementTagNameMap {
		'e-discord-user': DiscordUserElement;
	}
}

@customElement('e-discord-user')
export class DiscordUserElement extends LitElement {
	protected render() {
		return html`content`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}
	`;
}
