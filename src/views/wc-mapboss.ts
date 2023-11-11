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
	@property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';

	#askToSetTransitionName() {
		this.dispatchEvent(new CustomEvent<string>('set-transition-name', { detail: 'source', composed: true }));
	}

	protected render() {
		return html`<div class="mapboss">
			<ul class="maplist" style="" class="maps">
				${this.maps.map(m => html`<wc-map .size=${this.size} .map=${m}></wc-map>`)}
			</ul>
			<a @click=${this.#askToSetTransitionName} href="/source/?type=Map Boss&id=${this.boss.name}" class="name"
				>${this.boss.name}</a
			>
		</div>`;
	}
	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		.mapboss {
			width: fit-content;
		}

		.maplist {
			width: fit-content;
			margin-left: auto;
			display: flex;
			gap: 1rem;
		}

		.name {
		}
	`;
}
