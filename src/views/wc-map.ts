import { LitElement, html, nothing, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { IMap } from '../data/poeData.types';

declare global {
	interface HTMLElementTagNameMap {
		'wc-map': MapElement;
	}
}

@customElement('wc-map')
export class MapElement extends LitElement {
	@property({ type: Object }) map!: IMap;
	@property() mode: 'normal' | 'boss-tooltip' = 'normal';

	mapColor() {
		if (this.map.tier < 6) {
			return 'white';
		} else if (this.map.tier < 11) {
			return 'yellow';
		} else {
			const name = this.map.name;
			let special = ['Phoenix', 'Hydra', 'Chimra', 'Minotaur', 'Vaal Temple'].some(b => name.includes(b));
			if (special) {
				return 'special';
			} else {
				return 'red';
			}
		}
	}
	protected render() {
		return html`<div
			class=${classMap({
				map: true,
				[`map--${this.mapColor()}`]: !this.map.unique,
			})}
		>
			${this.renderName()}
			<div
				class=${classMap({
					'map-background': !this.map.unique,
				})}
			>
				<img
					class=${classMap({ img: true, 'img--with-background': !this.map.unique })}
					width="40"
					height="40"
					loading="lazy"
					src=${this.map.icon}
				/>
			</div>
		</div>`;
	}

	protected renderName() {
		return this.mode === 'normal' ? html` <p style="font-size:14px">${this.map.name}</p> ` : nothing;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		.map--yellow {
			--filter: contrast(1000%) sepia(100%) saturate(10000%);
		}
		.map--red {
			--filter: contrast(1000%) sepia(100%) saturate(10000%) hue-rotate(300deg) saturate(10000%);
		}

		.img {
			filter: var(--filter);
		}

		img {
			width: 40px;
			height: 40px;
		}

		.map-background {
			background-image: url(/images/map-background-image.png);
			background-position: center;
			background-repeat: no-repeat;
			background-size: 40px;
			width: 40px;
			height: 40px;
		}
	`;
}
