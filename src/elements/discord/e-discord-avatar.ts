import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'e-discord-avatar': DiscordAvatarElement;
	}
}

@customElement('e-discord-avatar')
export class DiscordAvatarElement extends LitElement {
	@property() src: string =
		'https://cdn.discordapp.com/avatars/212041922150137857/ed0f38962063b40da72b39db7662c3bf.webp';

	@property({ type: Number }) size = 40;

	protected render() {
		return html`here <img width=${this.size} height=${this.size} src=${this.src} alt="Discord Avatar" /> `;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		img {
			border-radius: 50%;
		}
	`;
}
