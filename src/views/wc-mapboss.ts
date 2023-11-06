import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IMapBoss, IMap } from '../data/poeData.types';
import './wc-map.js';

declare global {
	interface HTMLElementTagNameMap {
		'wc-mapboss': MapBossElement;
	}
}

@customElement('wc-mapboss')
export class MapBossElement extends LitElement {
	@property({ type: Object }) boss!: IMapBoss;
	@property({ type: Array }) maps: IMap[] = [];
	protected render() {
		return html`<div class="mapboss">
			<p>${this.boss.name}</p>
			<ul class="maplist" style="" class="maps">
				${this.maps.map(m => html`<wc-map .map=${m}></wc-map>`)}
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
