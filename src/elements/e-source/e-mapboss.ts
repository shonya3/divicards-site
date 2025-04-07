import { linkStyles } from '../../linkStyles';
import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './e-map';
import { sourceHref } from '../../utils';
import type { RenderMode } from '../types';
import type { MapArea, MapBoss } from '../../gen/poeData';
import { createSource } from '../../cards';
import { UpdateViewTransitionNameEvent } from '../../context/view-transition-name-provider';

/**
 *  @event navigate-transition NavigateTransitionEvent - Emits on clicking on any inner link element.
 */
@customElement('e-mapboss')
export class MapBossElement extends LitElement {
	@property({ reflect: true }) slug!: string;
	@property({ type: Object }) boss!: MapBoss;
	@property({ type: Array }) maps: MapArea[] = [];
	@property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';
	@property({ reflect: true }) href = '';
	@property({ reflect: true }) renderMode: RenderMode = 'normal';

	protected render(): TemplateResult {
		let imgSize: number | undefined = undefined;
		if (this.renderMode === 'compact') {
			imgSize = 25;
		} else {
			imgSize = 30;
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
							.href=${sourceHref(createSource({ type: 'Map', id: m.name }))}
							.size=${this.size === 'large' ? 'medium' : this.size}
							.map=${m}
							.renderMode=${this.renderMode}
							.imgSize=${imgSize}
						></e-map>`
				)}
			</ul>
			<a @click=${this.#dispatch_transition} href=${this.href} class="name">${this.boss.name}</a>
		</div>`;
	}

	#dispatch_transition() {
		this.dispatchEvent(new UpdateViewTransitionNameEvent({ transition_name: 'source', value: this.slug }));
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
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
		}

		.maplist {
			width: fit-content;
			margin-left: auto;
			display: flex;
			gap: 1rem;
		}

		.mapboss.rendermode--compact {
			flex-direction: row;
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

declare global {
	interface HTMLElementTagNameMap {
		'e-mapboss': MapBossElement;
	}
}
