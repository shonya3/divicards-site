import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IMapBoss, IMap } from '../data/poeData.types';
import './wc-map.js';
import { dispatchSetTransitionName } from '../events';
import { sourceHref } from '../utils';

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
	@property({ reflect: true }) href = '';

	protected render() {
		return html`<div class="mapboss">
			<ul class="maplist" style="" class="maps">
				${this.maps.map(
					m =>
						html`<wc-map
							.href=${sourceHref({ type: 'Map', id: m.name, kind: 'source-with-member' })}
							.size=${this.size === 'large' ? 'medium' : this.size}
							.map=${m}
						></wc-map>`
				)}
			</ul>
			<a @click=${dispatchSetTransitionName.bind(this, 'source')} href=${this.href} class="name"
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
	`;
}
