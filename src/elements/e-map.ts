import { LitElement, html, nothing, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { IMap } from '../data/poeData.types';
import { dispatchSetTransitionName } from '../events';

declare global {
	interface HTMLElementTagNameMap {
		'e-map': MapElement;
	}
}

@customElement('e-map')
export class MapElement extends LitElement {
	@property({ type: Object }) map!: IMap;
	@property() mode: 'normal' | 'boss-tooltip' = 'normal';
	@property({ reflect: true }) size: 'small' | 'medium' = 'medium';
	@property({ reflect: true }) href = '';

	get imageWidth() {
		switch (this.size) {
			case 'small': {
				return 40;
			}

			case 'medium': {
				return 60;
			}
		}
	}

	mapColor() {
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
	protected render() {
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
					<a @click=${dispatchSetTransitionName.bind(this, 'source')} href=${this.href} class="name"
						><img
							class=${classMap({ 'img-map-glyph': true, 'img--with-background': !this.map.unique })}
							width=${this.imageWidth}
							height=${this.imageWidth}
							loading="lazy"
							src=${this.map.icon}
					/></a>
				</div>
			</div>
		</div>`;
	}

	protected renderName() {
		return this.mode === 'normal'
			? html`
					<a @click=${dispatchSetTransitionName.bind(this, 'source')} href=${this.href} class="name"
						>${this.map.name}</a
					>
			  `
			: nothing;
	}

	static styles = css`
		:host {
			display: inline-block;
			object-fit: contain;
			contain: content;
		}

		* {
			padding: 0;
			margin: 0;
		}

		.map {
			font-size: var(--map-font-size, 1rem);
			width: var(--map-width, fit-content);
			text-align: center;
		}

		.name {
			font-weight: 400;
			font-size: var(--map-font-size, 1rem);
		}

		.map--medium,
		.map--large {
			--map-font-size: 24px;
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
		}

		.img-map-glyph {
			filter: var(--filter, initial);
		}

		.map-background {
			background-image: url(/images/map-background-image.png);
			background-position: center;
			background-repeat: no-repeat;
			background-size: var(--image-width);
			width: var(--image-width);
			height: var(--image-width);
		}
	`;
}
