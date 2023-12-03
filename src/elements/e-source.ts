import { classMap } from 'lit/directives/class-map.js';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ISource, SourceWithMember } from '../data/ISource.interface';
import type { CardSize } from './divination-card/e-divination-card';
import './e-act-area';
import './e-map';
import './e-mapboss';
import './e-actboss';
import './e-source-type';
import { IMap, poeData } from '../PoeData';
import { sourceHref } from '../utils';
import type { RenderMode } from './types';

declare global {
	interface HTMLElementTagNameMap {
		'e-source': SourceElement;
	}
}

export class NoSourceInPoeDataError extends Error {
	constructor(source: SourceWithMember) {
		super(`No ${source.type} in poeData ${source.id}`);
	}
}

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
				const area = poeData.findActAreaById(this.source.id);
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
				const res = poeData.findActbossAndArea(this.source.id);
				if (!res) throw new NoSourceInPoeDataError(this.source);
				return html`<e-actboss
					.href=${sourceHref(this.source)}
					.boss=${res.actAreaBoss}
					.actArea=${res.area}
					.renderMode=${this.renderMode}
				></e-actboss>`;
			}
			case 'Map': {
				const map = poeData.findMap(this.source.id);
				if (!map) throw new NoSourceInPoeDataError(this.source);
				return html`<e-map
					.href=${sourceHref(this.source)}
					.size=${this.size === 'large' ? 'medium' : this.size}
					.map=${map}
					.renderMode=${this.renderMode}
				></e-map>`;
			}
			case 'Map Boss': {
				const res = poeData.findMapbossAndMaps(this.source.id);
				if (!res) throw new NoSourceInPoeDataError(this.source);
				return html`<e-mapboss
					.href=${sourceHref(this.source)}
					.size=${this.size}
					.boss=${res.mapboss}
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
		return html`
			<div
				class=${classMap({
					source: true,
					[`source--${this.size}`]: true,
					'font--larger': !this.sourceHasSpecialElement,
				})}
			>
				${this.showSourceType && (this.renderMode === 'normal' || this.source.kind === 'empty-source')
					? html`<e-source-type class="source-type" .sourceType=${this.source.type}></e-source-type>`
					: nothing}
				<div class="inner">${this.sourceElement()}</div>
			</div>
		`;
	}

	static styles = css`
		* {
			margin: 0;
			padding: 0;
		}

		:host {
			display: inline-block;
			object-fit: contain;
			contain: paint;
			--source-width: fit-content;
		}

		.source {
			font-size: var(--source-font-size, 1rem);
			display: flex;
			width: var(--source-width);
			object-fit: contain;
			contain: paint;
			flex-direction: column;
		}

		a,
		a:visited {
			color: var(--source-color, #bbbbbb);
		}

		.source-type {
			width: fit-content;
			margin-inline: auto;
		}

		.source--medium,
		.source--large {
			--source-font-size: 1rem;
		}

		.inner {
			width: fit-content;
		}
	`;

	protected mapboss(name: string, iMaps: IMap[]) {
		return html`
			<div style="padding: 2rem; position: relative;">
				<p>${name}</p>
				<ul style="position: absolute; top: -1.6rem; right: -12px" class="maps">
					${iMaps.map(m => html`<e-map .map=${m}></e-map>`)}
				</ul>
			</div>
		`;
	}
}
