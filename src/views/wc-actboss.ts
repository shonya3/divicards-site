import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IActArea, IBossfight } from '../data/poeData.types';
import '../elements/act-area/wc-act-area.js';

declare global {
	interface HTMLElementTagNameMap {
		'wc-actboss': ActBossElement;
	}
}

@customElement('wc-actboss')
export class ActBossElement extends LitElement {
	@property({ type: Object }) boss!: IBossfight;
	@property({ type: Object }) actArea!: IActArea;
	protected render() {
		return html`<div class="actboss">
			<wc-act-area class="act-area" size="small" .actArea=${this.actArea}></wc-act-area>
			<p class="bossname">${this.boss.name}</p>
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
