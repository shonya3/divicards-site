import { LitElement, html, css, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { DISCORD_AVATARS, type DiscordUsername } from '../gen/avatars';

declare global {
	interface HTMLElementTagNameMap {
		'e-discord-avatar': DiscordAvatarElement;
	}
}

@customElement('e-discord-avatar')
export class DiscordAvatarElement extends LitElement {
	@property({ reflect: true }) username: DiscordUsername = 'nerdyjoe';
	@property({ type: Number, reflect: true }) size = 40;
	@state() src: string =
		'https://cdn.discordapp.com/avatars/212041922150137857/ed0f38962063b40da72b39db7662c3bf.webp';
	@state() color: string = '#fff';

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('username')) {
			const obj = DISCORD_AVATARS[this.username as DiscordUsername];
			if (obj) {
				this.src = `${obj.url}?size=${this.size}`;
				this.color = obj.color;
			}
		}

		if (map.has('color')) {
			this.style.setProperty('--color', this.color);
		}
	}

	protected render(): TemplateResult {
		return html`<img width=${this.size} height=${this.size} src=${this.src} alt="Discord Avatar" /> ${this
				.username}`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			color: var(--color);
			display: flex;
			gap: 0.15rem;
			align-items: center;
			width: fit-content;
		}

		img {
			border-radius: 50%;
		}
	`;
}
