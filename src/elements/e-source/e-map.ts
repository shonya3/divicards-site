import { linkStyles } from '../../linkStyles';
import { LitElement, html, nothing, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { RenderMode } from '../types';
import type { MapArea } from '../../gen/poeData';
import { NavigateTransitionEvent } from '../../events';

/**
 * * @event navigate-transition NavigateTransitionEvent - Emits on clicking on any inner link element.
 */
@customElement('e-map')
export class MapElement extends LitElement {
	@property({ reflect: true }) slug!: string;
	@property({ type: Object }) map!: MapArea;
	@property({ reflect: true }) size: 'small' | 'medium' = 'medium';
	@property({ reflect: true }) href = '';
	@property() renderMode: RenderMode = 'normal';
	@property({ type: Number, attribute: 'image-size' }) imgSize?: number;

	get imageWidth(): number {
		if (this.imgSize !== undefined) {
			return this.imgSize;
		}
		switch (this.size) {
			case 'small': {
				return 40;
			}

			case 'medium': {
				return 60;
			}
		}
	}

	mapColor(): 'white' | 'yellow' | 'red' | 'special' {
		if (this.map.tier < 6) {
			return 'white';
		} else if (this.map.tier < 11) {
			return 'yellow';
		} else {
			const name = this.map.name;
			const special = ['Harbinger', 'Phoenix', 'Hydra', 'Chimera', 'Minotaur', 'Vaal Temple'].some(b =>
				name.includes(b)
			);
			if (special) {
				return 'special';
			} else {
				return 'red';
			}
		}
	}
	protected render(): TemplateResult {
		return html`<div
			style="--image-width: ${this.imageWidth}px"
			class=${classMap({
				map: true,
				[`map--${this.mapColor()}`]: !this.map.unique,
				[`map--${this.size}`]: true,
			})}
		>
			${this.renderName()}
			<div class="img-wrapper">
				<div
					class=${classMap({
						'map-background': !this.map.unique,
					})}
				>
					<a @click=${this.#dispatch_transition} href=${this.href} class="name"
						><img
							class=${classMap({ 'img-map-glyph': true })}
							width=${this.imageWidth}
							height=${this.imageWidth}
							loading="lazy"
							src=${this.map.icon}
							alt=${this.map.name}
					/></a>
				</div>
			</div>
		</div>`;
	}

	protected renderName(): TemplateResult | typeof nothing {
		return this.renderMode === 'normal'
			? html` <a @click=${this.#dispatch_transition} href=${this.href} class="name">${this.map.name}</a> `
			: nothing;
	}

	#dispatch_transition() {
		this.dispatchEvent(new NavigateTransitionEvent('source', this.slug));
	}

	static styles = css`
		:host {
			display: inline-block;
			object-fit: contain;
			contain: content;
			color: var(--source-color, #bbbbbb);
			--image-width: var(--image-width, 10px);
		}

		@layer reset {
			${linkStyles}
		}

		* {
			padding: 0;
			margin: 0;
		}

		a,
		a:visited {
			color: var(--source-color, #bbbbbb);
		}

		a:hover {
			color: var(--link-color-hover);
		}

		.map {
			font-size: var(--map-font-size, 1rem);
			width: var(--map-width, fit-content);
			text-align: center;
		}

		.name {
			font-weight: 400;
		}

		.map--yellow {
			--filter: contrast(1000%) sepia(100%) saturate(10000%);
		}
		.map--red {
			--filter: contrast(1000%) sepia(100%) saturate(10000%) hue-rotate(300deg) saturate(10000%);
		}

		.img-wrapper {
			display: flex;
			justify-content: center;
			width: var(--image-width, fit-content);
			height: var(--image-width, fit-content);
			margin-inline: auto;
		}

		.img-map-glyph {
			filter: var(--filter, initial);
		}

		.map-background {
			background-image: url(/images/map-background-image.avif);
			background-position: center;
			background-repeat: no-repeat;
			background-size: var(--image-width);
			width: var(--image-width);
			height: var(--image-width);
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-map': MapElement;
	}
}
