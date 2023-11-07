import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IMapBoss, IMap, IActArea, IBossfight } from '../data/poeData.types';
import './wc-map.js';
import '../elements/act-area/wc-act-area.js';

declare global {
	interface HTMLElementTagNameMap {
		'wc-actboss': ActBossElement;
	}
}

@customElement('wc-actboss')
export class ActBossElement extends LitElement {
	@property({ type: Object }) boss!: IBossfight;
	@property() actAreaId = '';
	protected render() {
		return html`<div class="mapboss">
			<p>${this.boss.name}</p>
			<ul class="maplist" style="" class="maps">
				<wc-act-area .actId=${this.actAreaId}></wc-act-area>
			</ul>
		</div>`;
	}
	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		.mapboss {
			margin-top: 20px;

			position: relative;
			padding-top: 3rem;
			padding-right: 4rem;
		}

		.maplist {
			position: absolute;
			top: 0rem;
			right: 0rem;
		}
	`;
}
