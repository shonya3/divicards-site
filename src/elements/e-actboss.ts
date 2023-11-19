import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IActArea, IBossfight } from '../data/poeData.types';
import './e-act-area';
import { dispatchSetTransitionName } from '../events';
import { sourceHref } from '../utils';

declare global {
	interface HTMLElementTagNameMap {
		'e-actboss': ActBossElement;
	}
}

@customElement('e-actboss')
export class ActBossElement extends LitElement {
	@property({ type: Object }) boss!: IBossfight;
	@property({ type: Object }) actArea!: IActArea;
	@property({ reflect: true }) href: string = '';

	protected render() {
		return html`<div class="actboss">
			<e-act-area
				.href=${sourceHref({ type: 'Act', id: this.actArea.id, kind: 'source-with-member' })}
				class="act-area"
				size="small"
				.actArea=${this.actArea}
			></e-act-area>

			<a href=${this.href} @click=${dispatchSetTransitionName.bind(this, 'source')} class="bossname"
				>${this.boss.name}</a
			>
		</div>`;
	}
	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		.bossname {
			width: fit-content;
		}

		.act-area {
			margin-left: 4rem;
			transform: translateY(0.4rem);
		}
	`;
}
