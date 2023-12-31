import { linkStyles } from './../linkStyles';
import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './e-map';
import { dispatchSetTransitionName } from '../events';
import { sourceHref } from '../utils';
import type { RenderMode } from './types';
import type { IMap, IMapBoss } from '../PoeData';

declare global {
	interface HTMLElementTagNameMap {
		'e-mapboss': MapBossElement;
	}
}

@customElement('e-mapboss')
export class MapBossElement extends LitElement {
	@property({ type: Object }) boss!: IMapBoss;
	@property({ type: Array }) maps: IMap[] = [];
	@property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';
	@property({ reflect: true }) href = '';
	@property({ reflect: true }) renderMode: RenderMode = 'normal';

	protected render() {
		let imgWidth: number | undefined = undefined;
		if (this.renderMode === 'compact') {
			imgWidth = 25;
		}

		return html`<div
			class=${classMap({
				mapboss: true,
				[`rendermode--${this.renderMode}`]: true,
			})}
		>
			<ul class="maplist" style="" class="maps">
				${this.maps.map(
					m =>
						html`<e-map
							.href=${sourceHref({ type: 'Map', id: m.name, kind: 'source-with-member' })}
							.size=${this.size === 'large' ? 'medium' : this.size}
							.map=${m}
							.renderMode=${this.renderMode}
							.imgWidth=${imgWidth}
						></e-map>`
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

		@layer reset {
			${linkStyles}
		}

		:host {
			color: var(--source-color, #bbbbbb);
			font-size: var(--source-font-size);
			--map-font-size: 0.75rem;
		}

		a,
		a:visited {
			color: var(--source-color, #bbbbbb);
		}

		a:hover {
			color: var(--link-color-hover);
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

		.mapboss.rendermode--compact {
			display: flex;
			justify-content: center;
			align-items: center;
			--map-image-width: 30px;
			gap: 0.05rem;
		}

		.mapboss.rendermode--compact .maplist {
			gap: 0;
		}

		.mapboss.rendermode--compact .maplist {
			order: 2;
		}
	`;
}
