import { classMap } from 'lit/directives/class-map.js';
import { html, css, PropertyValues, nothing, LitElement } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cardsDataMap } from './data';

declare global {
	interface HTMLElementTagNameMap {
		'e-divination-card': DivinationCardElement;
	}
}

export type CardSize = 'small' | 'medium' | 'large';

export interface Props {
	name: string;
	size: CardSize;
}
export interface Events {}

@customElement('e-divination-card')
export class DivinationCardElement extends LitElement {
	static override styles = styles();

	@property({ reflect: true }) name: string = '';
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ reflect: true, attribute: 'min-level-or-range' }) minLevelOrRange?: string;
	@property({ reflect: true }) boss?: string;

	@state() stackSize: number = 0;
	@state() flavourText: string = ``;
	@state() artFilename: string = '';
	@state() rewardHtml: string = '';

	get imageUrl() {
		if (!this.artFilename) {
			// console.warn(`Divination Card. No artFilename ${this.name}`);
			return '';
		}
		// return `/images/cards/${this.artFilename}.png`;
		return `https://web.poecdn.com/image/divination-card/${this.artFilename}.png`;
	}

	protected nameMarginTop(size: CardSize) {
		switch (size) {
			case 'small':
				return '0rem';
			case 'medium':
				return '0rem';
			case 'large':
				return '0.4rem';
		}
	}

	protected willUpdate(changedProperties: PropertyValues<this>): void {
		if (changedProperties.has('name')) {
			if (this.name === 'Fire of unknown origin') {
				console.log('here');
			}
			const name = this.name === 'Fire of Unknown Origin' ? 'Fire Of Unknown Origin' : this.name;
			const cardData = cardsDataMap.get(name);
			if (cardData) {
				this.stackSize = cardData.stackSize ?? 1;
				this.flavourText = cardData.flavourText;
				this.artFilename = cardData.artFilename;
				this.rewardHtml = cardData.rewardHtml;
			}
		}
	}

	#onNavigation() {
		this.style.setProperty('view-transition-name', 'card');
	}

	protected override render() {
		const sizeMap = styleMap({
			'--card-width': `var(--card-width-${this.size})`,
			'--card-height': `var(--card-height-${this.size})`,
		});

		const nameTopPadding = styleMap({
			'margin-top': this.nameMarginTop(this.size),
		});

		return html` <div
			class=${classMap({
				'divination-card': true,
				[`divination-card--${this.size}`]: true,
			})}
		>
			<a class="link" @click=${this.#onNavigation} href="/card/${this.name}"> </a>


			<div
				class=${classMap({
					skeleton: true,
					[`skeleton--${this.size}`]: true,
				})}
				style=${sizeMap}
			></div>
			<header class="${classMap({ name: true, size22: this.size === 'small' })}" style=${nameTopPadding}>
				<a @click=${this.#onNavigation} href="/card/${this.name}"> ${this.name} </a>
			</header>
			<div class="imageWrapper">
				<a @click=${this.#onNavigation} href="/card/${this.name}">
					<img loading="lazy" class="image" width="100%" src=${this.imageUrl} alt="" />
				</a>
			</div>

				<div
					class=${classMap({
						stackSize: true,
						[`stackSize--${this.size}`]: this.size,
					})}
				>
					${this.stackSize}
				</div>
				<div class="${classMap({ 'bottom-half': true, size25: this.size === 'small' })}">
					${staticHtml`${unsafeStatic(this.rewardHtml)}`}
					${this.size !== 'small' ? html`${this.divider()}${this.footer()}` : nothing}
				</div>
				${this.minLevelOrRange ? html` <div title="Min. Level" class="min-level">${this.minLevelOrRange}</div> ` : nothing}

				<div class="boss">
					<slot name="boss"> ${this.boss ? html`${this.boss}` : nothing} </slot>
				</div>
			</div>
		</div>`;
	}

	protected divider() {
		return html`<div class="divider"></div>`;
	}

	protected footer() {
		return html`<footer>
			<p style="font-style: italic" class="flavourText">${this.flavourText}</p>
		</footer>`;
	}
}

function styles() {
	return css`
		:host {
			display: block;
			object-fit: contain;
			contain: paint;

			--card-width-small: 134px;
			--card-width-medium: 268px;
			--card-width-large: 326px;
			--card-font-size: 1rem;
			--card-aspect-ratio: 0.668329;

			--font-small: 0.8rem;

			--item-normal: 0, 0%, 78%;
			--item-rare: 60, 100%, 73%;
			--item-magic: 240, 100%, 77%;
			--item-unique-contrast: 25, 63%, 48%;
			--item-unique: 26, 65%, 42%;
			--item-gem: 177, 72%, 37%;
			--item-relic: 0, 0%, 78%;
			--item-currency: 42, 19%, 59%;
			--item-prophecy: 275, 100%, 65%;
			--item-divination: 0, 0%, 50%;
			--item-keystone: 46, 52%, 74%;
			--item-explicit: 240, 100%, 77%;
			--item-implicit: var(--item-explicit);
			--item-crafted: 240, 100%, 85%;
			--item-enchanted: var(--item-crafted);
			--item-fractured: 44, 26%, 51%;
			--item-corrupted: 0, 100%, 41%;
			--item-scourge: 20, 100%, 57%;
			--item-physical: 0, 0%, 58%;
			--item-fire: 0, 100%, 29%;
			--item-cold: 210, 46%, 39%;
			--item-lightning: 51, 100%, 50%;
			--item-chaos: 322, 73%, 47%;
			--item-augmented: rgb(138, 138, 255);
			--coolgrey-1000: 206, 24%, 7%;

			width: fit-content;
		}

		* {
			margin: 0;
			padding: 0;
		}

		.min-level {
			position: absolute;
			z-index: 4;
			bottom: 0;
			right: 0.75rem;
			font-size: var(--digits-font-size);
		}

		.boss {
			position: absolute;
			z-index: 4;
			bottom: 0;
			left: 0rem;
			font-size: var(--digits-font-size);
		}

		.divination-card {
			font-family: 'fontin', Verdana, Arial;

			width: var(--card-width, var(--card-width-medium));
			aspect-ratio: var(--card-aspect-ratio);

			text-align: center;
			overflow: hidden;

			display: flex;
			flex-direction: column;

			position: relative;
		}

		.divination-card--small {
			--card-width: var(--card-width-small);
			--reward-font-size: 0.8rem;
			--digits-font-size: 0.6rem;
		}

		.divination-card--medium {
			--reward-font-size: 1rem;
			--card-width: var(--card-width-medium);
			--name-font-size: 18px;
			--digits-font-size: ;
		}

		.divination-card--large {
			--reward-font-size: 1.2rem;
			--reward-line-height: 1.15rem;
			--reward-letter-spacing: -0.4px;
			--card-width: var(--card-width-large);
			--name-font-size: 24px;
			--name-line-height: 17px;
		}

		.skeleton {
			background: rgba(0, 0, 0, 0) url(/images/cards/divination-card.png) no-repeat center;
			background-size: 105%;
			z-index: 3;
			position: absolute;

			width: var(--card-width, var(--card-width-medium));
			aspect-ratio: var(--card-aspect-ratio);
		}

		a {
			color: #000;
			text-decoration: none;
		}

		.name {
			line-height: var(--name-line-height, 1.5rem);
			font-size: var(--name-font-size, 1rem);
			letter-spacing: -0.6px;
			z-index: 4;
		}

		a:hover {
			color: #083344;
			text-decoration: underline;
		}

		.stackSize {
			display: flex;
			align-items: center;
			justify-content: center;

			position: absolute;
			color: #c8c8c8;
			left: 8%;
			top: 46.8%;
			z-index: 4;
			width: 16%;
			font-size: 1rem;
			height: 26px;
		}

		.stackSize--small {
			top: 42.8%;
			font-size: 0.6rem;
		}

		.stackSize--medium {
			top: 46.3%;
		}

		.bottom-half {
			position: absolute;
			top: 52%;
			height: 44%;
			width: 90%;
			z-index: 4;
			margin: 0 6% 6%;

			margin-top: 0.4rem;
			display: flex;
			flex-direction: column;
			justify-content: space-evenly;

			flex: 1;
		}

		.reward {
			font-size: var(--reward-font-size, 0.8rem);
			line-height: var(--reward-line-height);
			letter-spacing: var(--reward-letter-spacing);
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}

		.link {
			position: absolute;
			top: 30px;
			left: 0;
			width: 100%;
			height: calc(50% - 30px);
			z-index: 20;
		}

		.flavourText {
			font-size: 1rem;
			color: rgba(167, 90, 27, 1);
			text-wrap: balance;
			font-style: italic;
			line-height: 1.2rem;
		}

		.divider {
			height: 1px;
			width: 50%;
			transform: translateX(50%);

			background-image: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
		}

		::slotted(e-source) {
			--source-font-size: 0.8rem;
			margin-left: 0.8rem;
		}

		.currencyItem {
			color: hsla(var(--item-currency));
		}

		.uniqueItem {
			color: hsla(var(--item-unique));
		}

		.fractured {
			color: hsla(var(--item-fractured));
		}

		.enchanted {
			color: hsla(var(--item-enchanted));
		}

		.normal {
			color: hsla(var(--item-normal));
		}

		.default {
			color: #7f7f7f;
		}

		.magicItem {
			color: hsla(var(--item-magic));
		}

		.rareItem {
			color: hsla(var(--item-rare));
		}
		.corrupted {
			color: hsla(var(--item-corrupted));
		}
		.rare {
			color: hsla(var(--item-rare));
		}

		.divination {
			color: #0ebaff;
		}

		.augmented {
			color: var(--item-augmented);
		}

		.gemItem {
			color: hsla(var(--item-gem));
		}

		.size22 {
			font-size: 11px;
			line-height: 0.8rem;
		}

		.size25 {
			font-size: 12.5px;
			line-height: 0.9rem;
		}

		.size26 {
			font-size: 13px;
		}

		.size27 {
			font-size: 13.5px;
		}
		.size28 {
			font-size: 14px;
		}

		.size29 {
			font-size: 14.5px;
		}

		.size30 {
			font-size: 15px;
		}

		.size31 {
			font-size: 15.5px;
		}

		p {
			line-height: inherit;
		}

		p:has(.size25) {
			line-height: 0.9rem;
		}

		p:has(.size26) {
			line-height: 0.95rem;
		}

		p:has(.size27) {
			line-height: 1rem;
		}

		p:has(.size28) {
			line-height: 1.05rem;
		}

		p:has(.size29) {
			line-height: 1.1rem;
		}

		p:has(.size30) {
			line-height: 1.15rem;
		}
	`;
}
