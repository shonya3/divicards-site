import { classMap } from 'lit/directives/class-map.js';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ISource, SourceWithMember } from '../data/ISource.interface';
import type { CardSize } from './divination-card/wc-divination-card';
import './wc-act-area';
import './wc-map';
import './wc-mapboss';
import './wc-actboss';
import './wc-source-type';
import { PoeData } from '../PoeData';
import type { IMap } from '../data/poeData.types';
import { sourceHref } from '../utils';

declare global {
	interface HTMLElementTagNameMap {
		'wc-source': SourceElement;
	}
}

export class NoSourceInPoeDataError extends Error {
	constructor(source: SourceWithMember) {
		super(`No ${source.type} in poeData ${source.id}`);
	}
}

@customElement('wc-source')
export class SourceElement extends LitElement {
	@property({ type: Object }) poeData!: PoeData;
	@property({ type: Object }) source!: ISource;
	@property({ type: Boolean }) showSourceType = true;
	@property() size: CardSize = 'small';

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
				const area = this.poeData.findActAreaById(this.source.id);
				if (!area) throw new NoSourceInPoeDataError(this.source);
				return html`<wc-act-area
					.href=${sourceHref(this.source)}
					.actArea=${area}
					.size=${this.size === 'medium' ? 'large' : this.size}
				></wc-act-area>`;
			}
			case 'Act Boss': {
				const res = this.poeData.findActbossAndArea(this.source.id);
				if (!res) throw new NoSourceInPoeDataError(this.source);
				return html`<wc-actboss
					.href=${sourceHref(this.source)}
					.boss=${res.actAreaBoss}
					.actArea=${res.area}
				></wc-actboss>`;
			}
			case 'Map': {
				const map = this.poeData.findMap(this.source.id);
				if (!map) throw new NoSourceInPoeDataError(this.source);
				return html`<wc-map
					.href=${sourceHref(this.source)}
					.size=${this.size === 'large' ? 'medium' : this.size}
					.map=${map}
				></wc-map>`;
			}
			case 'Map Boss': {
				const res = this.poeData.findMapbossAndMaps(this.source.id);
				if (!res) throw new NoSourceInPoeDataError(this.source);
				return html`<wc-mapboss
					.href=${sourceHref(this.source)}
					.size=${this.size}
					.boss=${res.mapboss}
					.maps=${res.maps}
				></wc-mapboss>`;
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
		customElements.get('wc-source-type');

		return html`
			<div
				class=${classMap({
					source: true,
					[`source--${this.size}`]: true,
					'font--larger': !this.sourceHasSpecialElement,
				})}
			>
				${this.showSourceType
					? html`<wc-source-type class="source-type" .sourceType=${this.source.type}></wc-source-type>`
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
			max-width: fit-content;
			object-fit: contain;
			contain: paint;
		}

		.source {
			--source-font-size: 20px;
			font-size: var(--source-font-size);
			display: flex;
			width: fit-content;
			object-fit: contain;
			contain: paint;
			flex-direction: column;
		}

		.source-type {
			width: fit-content;
			margin-inline: auto;
		}

		.source--medium,
		.source--large {
			--source-font-size: 24px;
		}

		.inner {
			width: fit-content;
		}
	`;

	fallback() {}

	protected mapboss(name: string, iMaps: IMap[]) {
		return html`
			<div style="padding: 2rem; position: relative;">
				<p>${name}</p>
				<ul style="position: absolute; top: -1.6rem; right: -12px" class="maps">
					${iMaps.map(m => html`<wc-map .map=${m}></wc-map>`)}
				</ul>
			</div>
		`;
	}
}
