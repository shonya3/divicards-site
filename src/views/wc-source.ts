import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ISource } from '../data/ISource.interface.ts';
import type { IPoeData, IMap } from '../data/poeData.types';
import type { CardSize } from '../elements/divination-card/wc-divination-card';
import '../elements/act-area/wc-act-area.js';
import './wc-map.js';
import './wc-mapboss.js';

declare global {
	interface HTMLElementTagNameMap {
		'wc-source-element': SourceElement;
	}
}

@customElement('wc-source-element')
export class SourceElement extends LitElement {
	@property({ type: Object }) poeData!: IPoeData;
	@property({ type: Object }) source!: ISource;
	@property() size: CardSize = 'small';

	protected sourceElement() {
		if (this.source.type === 'Act') {
			return this.actArea(this.source.id);
		}

		if (this.source.type === 'Map') {
			const map = this.poeData.maps.find(map => map.name === this.source.id);
			if (!map) {
				throw new Error(`No map found ${this.source.id}`);
			}
			// return this.map(map.name, map.icon);
			return html`<wc-map .map=${map}></wc-map>`;
		}

		if (this.source.type === 'Map Boss') {
			const boss = this.poeData.mapbosses.find(boss => boss.name === this.source.id);
			if (!boss) {
				throw new Error(`No mapboss ${this.source.id}`);
			}
			const maps = boss.maps.map(m => this.poeData.maps.find(map => map.name === m)!);
			return html`<wc-mapboss .boss=${boss} .maps=${maps}></wc-mapboss>`;
		}

		return html`<p>${this.source.id ?? nothing}</p>`;
		// return html`<wc-general-source .source=${this.source}></wc-general-source>`;
	}

	render() {
		return html`
			<div class="source">
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

		.source-type {
			color: darkviolet;
			font-family: sans-serif;
			font-size: 16px;
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

	protected map(name: string, icon: string) {
		return html`<div>
			<p style="font-size: 14px">${name}</p>
			<img width="40" height="40" loading="lazy" src=${icon} />
		</div>`;
	}

	protected actArea(actId: string) {
		if (!this.poeData) {
			console.warn('no poeData');
		}
		return html`<wc-act-area
			.size=${this.size === 'medium' ? 'large' : this.size}
			.actId=${actId}
			.actsData=${this.poeData.acts}
		></wc-act-area>`;
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
