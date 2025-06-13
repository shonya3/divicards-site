import { LitElement, html, css, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { DISCORD_AVATARS, type DiscordUsername } from '../../gen/avatars';

@customElement('e-discord-avatar')
export class DiscordAvatarElement extends LitElement {
	@property({ reflect: true }) username: DiscordUsername = 'nerdyjoe';
	@property({ type: Number, reflect: true }) size = 32;
	@state() src: string = '';
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
		return html`${this.src
			? html`<img width=${this.size} height=${this.size} src=${this.src} alt="Discord Avatar" /> ${this.username}`
			: this.username}`;
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

declare global {
	interface HTMLElementTagNameMap {
		'e-discord-avatar': DiscordAvatarElement;
	}
}
