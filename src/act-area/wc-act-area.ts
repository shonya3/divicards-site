import { classMap } from 'lit/directives/class-map.js';
import { html, css, PropertyValues, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { IActArea } from '../data/poeData.types';

declare global {
	interface HTMLElementTagNameMap {
		'wc-act-area': ActAreaElement;
	}
}

export type Size = 'small' | 'large';

@customElement('wc-act-area')
export class ActAreaElement extends LitElement {
	static override styles = [styles()];

	@property({ type: Array, attribute: false }) actsData: Readonly<IActArea[]> = [];
	@property({ reflect: true }) name: string = '';
	@property({ reflect: true }) size: Size = 'large';
	@property({ type: Number, reflect: true }) act: number = 0;
	@property({ type: Number, reflect: true }) monsterLevel: number = 0;
	@property() actId: string = '';
	@property() img: string = '';

	protected willUpdate(changedProperties: PropertyValues<this>): void {
		if (changedProperties.has('actId')) {
			const actAreaData = this.actsData.find(a => a.id === this.actId);
			if (actAreaData) {
				this.name = actAreaData.name;
				this.act = actAreaData.act;
				this.img = actAreaData.imageUrl;
				this.monsterLevel = actAreaData.areaLevel;
			}
		}
	}

	protected override render() {
		return html`<div
			style="--act-area-background-image: url(${this.img})"
			class=${classMap({
				'act-area': true,
				'act-area--small': this.size === 'small',
				'act-area--large': this.size === 'large',
			})}
		>
			<div class="name">${this.name} (Act ${this.act})</div>
			<div class="monster-level">Monster level: ${this.monsterLevel}</div>
		</div>`;
	}
}

function styles() {
	return css`
		:host {
			display: inline-block;

			/* 507x98  */
			--act-area-background-image: '';
			--act-area-name-color: #fec076;
			--act-area-width-small: 261px;
			--act-area-width-large: 507px;
			--act-area-font-size-small: 15px;
			--act-area-font-size-large: 24px;
		}

		.act-area {
			width: var(--act-area-width);
			background: rgba(0, 0, 0, 0) no-repeat center;
			background-size: 100%;
			background-image: var(--act-area-background-image);
			aspect-ratio: 5.173;
			position: relative;
		}

		.act-area--small {
			--act-area-width: var(--act-area-width-small);
			--act-area-font-size: var(--act-area-font-size-small);
			--act-area-name-top: 8px;
			--act-area-name-left: 20px;
			--act-area-monster-level-top: 32px;
			--act-area-monster-level-left: 20px;
			--act-area-monster-level-font-size: 12px;
		}

		.act-area--large {
			--act-area-width: var(--act-area-width-large);
			--act-area-font-size: var(--act-area-font-size-large);
			--act-area-name-top: 20px;
			--act-area-name-left: 44px;
			--act-area-monster-level-top: 62px;
			--act-area-monster-level-left: 44px;
			--act-area-monster-level-font-size: 20px;
		}

		img {
			width: 100%;
		}

		.name {
			position: absolute;
			font-size: var(--act-area-font-size, 20px);
			top: var(--act-area-name-top);
			left: var(--act-area-name-left);
			color: var(--act-area-name-color, red);
		}

		.monster-level {
			position: absolute;
			top: var(--act-area-monster-level-top);
			left: var(--act-area-monster-level-left);
			font-size: var(--act-area-monster-level-font-size);
		}
	`;
}
