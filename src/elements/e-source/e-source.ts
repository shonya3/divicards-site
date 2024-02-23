import { linkStyles } from '../../linkStyles';
import { classMap } from 'lit/directives/class-map.js';
import { LitElement, PropertyValueMap, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ISource } from '../../gen/ISource.interface';
import type { CardSize } from '../divination-card/e-divination-card';
import './e-act-area';
import './e-map';
import './e-mapboss';
import './e-actboss';
import '../e-source-type';
import { poeData } from '../../PoeData';
import { sourceHref } from '../../utils';
import type { RenderMode } from '../types';
import type { MapArea } from '../../gen/poeDataFromJson';

declare global {
	interface HTMLElementTagNameMap {
		'e-source': SourceElement;
	}
}

export class NoSourceInPoeDataError extends Error {
	constructor(source: ISource) {
		super(`No ${source.type} in poeData ${source.id}`);
	}
}

/**
 * @summary Any dropsource of divination card: map, act, etc

 * @cssproperty --padding-inline - The inline padding to use for for element.
 * @cssproperty --padding-block - The block padding to use for for element.
 */
@customElement('e-source')
export class SourceElement extends LitElement {
	@property({ type: Object }) source!: ISource;
	@property({ type: Boolean }) showSourceType = true;
	@property() size: CardSize = 'small';
	@property() renderMode: RenderMode = 'normal';
	@property() actSize?: 'small' | 'large';

	get sourceHasSpecialElement() {
		return ['Act', 'Act Boss', 'Map', 'Map Boss'].includes(this.source.type);
	}

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('source')) {
			this.setAttribute('source-type', this.source.type);
		}
	}

	constructor() {
		super();
		this.addEventListener('set-transition-name', e => {
			this.#setViewTransitionName(e.detail);
		});
	}

	#setViewTransitionName(transitionName = 'source') {
		this.style.setProperty('view-transition-name', transitionName);
	}

	protected sourceElement() {
		if (this.source.kind === 'empty-source') {
			return nothing;
		}

		switch (this.source.type) {
			case 'Act': {
				const area = poeData.find.actArea(this.source.id);
				if (!area) throw new NoSourceInPoeDataError(this.source);
				let size: CardSize = this.size === 'medium' ? 'large' : this.size;
				if (this.renderMode === 'compact') {
					size = 'small';
				}

				if (this.actSize) {
					size = this.actSize;
				}

				return html`<e-act-area .href=${sourceHref(this.source)} .actArea=${area} .size=${size}></e-act-area>`;
			}
			case 'Act Boss': {
				const res = poeData.find.actBossAndArea(this.source.id);
				if (!res) throw new NoSourceInPoeDataError(this.source);
				return html`<e-actboss
					.href=${sourceHref(this.source)}
					.boss=${res.boss}
					.actArea=${res.area}
					.renderMode=${this.renderMode}
				></e-actboss>`;
			}
			case 'Map': {
				const map = poeData.find.map(this.source.id);
				if (!map) throw new NoSourceInPoeDataError(this.source);
				return html`<e-map
					.href=${sourceHref(this.source)}
					.size=${this.size === 'large' ? 'medium' : this.size}
					.map=${map}
					.renderMode=${this.renderMode}
				></e-map>`;
			}
			case 'Map Boss': {
				const res = poeData.find.mapBossAndMaps(this.source.id);
				if (!res) throw new NoSourceInPoeDataError(this.source);
				return html`<e-mapboss
					.href=${sourceHref(this.source)}
					.size=${this.size}
					.boss=${res.boss}
					.maps=${res.maps}
					.renderMode=${this.renderMode}
				></e-mapboss>`;
			}

			default: {
				if (!this.source.id) return nothing;

				return html`<a
					@click=${this.#setViewTransitionName.bind(this, 'source')}
					href=${sourceHref(this.source)}
					>${this.source.id}</a
				>`;
			}
		}
	}

	render() {
		const shouldRenderSourceType = this.renderMode === 'normal' || this.source.kind === 'empty-source';

		return html`
			<div
				class=${classMap({
					source: true,
					[`source--${this.size}`]: true,
					'font--larger': !this.sourceHasSpecialElement,
				})}
			>
				${this.showSourceType && shouldRenderSourceType
					? html`<e-source-type
							part="source-type"
							class="source-type"
							.sourceType=${this.source.type}
					  ></e-source-type>`
					: nothing}
				<div part="source-id" class="source-id">${this.sourceElement()}</div>
			</div>
		`;
	}

	static styles = css`
		* {
			margin: 0;
			padding: 0;
		}

		@layer reset {
			${linkStyles}
		}

		:host {
			display: inline-block;
			object-fit: contain;
			contain: paint;
			--source-width: fit-content;
			max-width: max-content;
			--source-type-font-size: 0.875rem;
			--padding-inline: 0;
			--padding-block: 0;
		}

		.source {
			font-size: var(--source-font-size, 1rem);
			display: flex;
			width: var(--source-width);
			object-fit: contain;
			contain: paint;
			flex-direction: column;
			justify-content: center;
			padding-inline: var(--padding-inline);
			padding-block: var(--padding-block);
		}

		e-source-type {
			margin-inline: auto;
		}

		.inner {
			width: fit-content;
		}
	`;

	protected mapboss(name: string, mapAreas: MapArea[]) {
		return html`
			<div style="padding: 2rem; position: relative;">
				<p>${name}</p>
				<ul style="position: absolute; top: -1.6rem; right: -12px" class="maps">
					${mapAreas.map(m => html`<e-map .map=${m}></e-map>`)}
				</ul>
			</div>
		`;
	}
}
