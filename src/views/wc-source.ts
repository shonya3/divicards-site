import { classMap } from 'lit/directives/class-map.js';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ISource } from '../data/ISource.interface.ts';
import type { CardSize } from '../elements/divination-card/wc-divination-card';
import '../elements/act-area/wc-act-area.js';
import './wc-map.js';
import './wc-mapboss.js';
import './wc-actboss.js';
import { PoeData } from '../PoeData.ts';
import type { IMap } from '../data/poeData.types';

declare global {
	interface HTMLElementTagNameMap {
		'wc-source': SourceElement;
	}
}

export class NoSourceInPoeDataError extends Error {
	constructor(source: ISource) {
		super(`No ${source.type} in poeData ${source.id}`);
	}
}

@customElement('wc-source')
export class SourceElement extends LitElement {
	@property({ type: Object }) poeData!: PoeData;
	@property({ type: Object }) source!: ISource;
	@property() size: CardSize = 'small';

	get sourceHasSpecialElement() {
		return ['Act', 'Act Boss', 'Map', 'Map Boss'].includes(this.source.type);
	}

	constructor() {
		super();
		this.addEventListener('set-transition-name', e => {
			if (e instanceof CustomEvent) {
				if (typeof e.detail === 'string') {
					this.#setViewTransitionName(e.detail);
				}
			}
		});
	}

	#setViewTransitionName(transitionName = 'source') {
		console.log(transitionName);
		this.style.setProperty('view-transition-name', transitionName);
	}

	protected sourceElement() {
		switch (this.source.type) {
			case 'Act': {
				const area = this.poeData.findActAreaById(this.source.id);
				if (!area) throw new NoSourceInPoeDataError(this.source);
				return html`<wc-act-area
					.actArea=${area}
					.size=${this.size === 'medium' ? 'large' : this.size}
				></wc-act-area>`;
			}
			case 'Act Boss': {
				const res = this.poeData.findActbossAndArea(this.source.id);
				if (!res) throw new NoSourceInPoeDataError(this.source);
				return html`<wc-actboss .boss=${res.actAreaBoss} .actArea=${res.area}></wc-actboss>`;
			}
			case 'Map': {
				const map = this.poeData.findMap(this.source.id);
				if (!map) throw new NoSourceInPoeDataError(this.source);
				return html`<wc-map .size=${this.size} .map=${map}></wc-map>`;
			}
			case 'Map Boss': {
				const res = this.poeData.findMapbossAndMaps(this.source.id);
				if (!res) throw new NoSourceInPoeDataError(this.source);
				return html`<wc-mapboss .size=${this.size} .boss=${res.mapboss} .maps=${res.maps}></wc-mapboss>`;
			}
			default: {
				if (!this.source.id) return nothing;
				return html`<a
					@click=${this.#setViewTransitionName.bind(this, 'source')}
					href="/source/?type=${this.source.type}&id=${this.source.id}"
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
				<div class="source-type">${this.source.type}</div>
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
			display: block;
			width: fit-content;
			object-fit: contain;
			contain: paint;
		}

		.source--medium,
		.source--large {
			--source-font-size: 24px;
		}

		.source-type {
			text-align: center;
			color: orange;
			font-weight: 700;
			font-size: var(--source-font-size);
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

declare global {
	interface HTMLElementTagNameMap {
		'wc-general-source': GeneralSourceElement;
	}
}

@customElement('wc-general-source')
export class GeneralSourceElement extends LitElement {
	@property({ type: Object }) source!: ISource;

	protected withId() {
		return html``;
	}
	protected noId() {
		return html``;
	}

	protected render() {
		return html`<pre
			style="font-size: 18px; text-align: left; box-shadow: rgba(100, 100, 111, 0.2) 0px 2px 10px 0px;"
		>
${JSON.stringify(this.source, null, 2)}</pre
		> `;

		const el = this.source.id === undefined ? this.noId() : this.withId();
		return el;
	}
}
