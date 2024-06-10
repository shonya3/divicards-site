import { classMap } from 'lit/directives/class-map.js';
import { html, PropertyValues, nothing, LitElement, TemplateResult } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { customElement, property, state } from 'lit/decorators.js';
import { cardsDataMap } from './data';
import { DivcordTable } from '../../DivcordTable';
import { consume } from '@lit/context';
import { divcordTableContext } from '../../context';
import { PoeData, poeData } from '../../PoeData';
import { styles } from './divination-card.styles';

/**
 * @summary Divination Card

 * @cssproperty --padding-inline - The inline padding to use for for element.
 * @cssproperty --padding-block - The block padding to use for for element.
 */
@customElement('e-divination-card')
export class DivinationCardElement extends LitElement {
	@property({ reflect: true }) name: string = '';
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ reflect: true }) boss?: string;

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable?: DivcordTable;

	@state() stackSize: number = 0;
	@state() flavourText: string = ``;
	@state() artFilename: string = '';
	@state() rewardHtml: string = '';
	@state() minLevelOrRange?: string;

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

		if (changedProperties.has('divcordTable') && this.divcordTable) {
			this.minLevelOrRange = minLevelOrRange(this.name, this.divcordTable, poeData);
		}
	}

	protected render(): TemplateResult {
		return html`<div class="element">
			<div
				class=${classMap({
					'divination-card': true,
					[`divination-card--${this.size}`]: true,
				})}
			>
				<a class="link" @click=${this.#onNavigation} href="/card/${this.name}"></a>
				<div class="skeleton"></div>
				<header
					class=${classMap({
						name: true,
						[`name--${this.size}`]: true,
					})}
				>
					<a @click=${this.#onNavigation} href="/card/${this.name}"> ${this.name} </a>
				</header>
				<div class="imageWrapper">
					<a @click=${this.#onNavigation} href="/card/${this.name}">
						<img
							loading="lazy"
							class="image"
							width="100%"
							src=${imageurl(this.artFilename)}
							alt="card's image"
						/>
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
					<div class="divider"></div>
					<footer>
						<p class="flavourText">${this.flavourText}</p>
					</footer>
				</div>
				${this.minLevelOrRange
					? html`<div title="Min. Level" class="min-level">${this.minLevelOrRange}</div> `
					: nothing}

				<div class="boss">
					<slot name="boss"> ${this.boss ? html`${this.boss}` : nothing} </slot>
				</div>
			</div>
		</div>`;
	}

	#onNavigation() {
		this.style.setProperty('view-transition-name', 'card');
	}
	static override styles = styles;
}

export type CardSize = '50' | '75' | 'small' | 'medium' | 'large';

function minLevelOrRange(card: string, divcordTable: DivcordTable, poeData: PoeData): string {
	const globals = divcordTable.globalDrops();
	const globalDropSource = globals.get(card);
	if (!globalDropSource) {
		return String(poeData.cardMinLevel(card));
	}

	const { min_level, max_level } = globalDropSource;

	if (min_level && !max_level) {
		return `global ${min_level}+`;
	}

	return `global ${min_level ?? ''} - ${max_level ?? ''}`;
}

function imageurl(artFilename?: string): string {
	if (!artFilename) {
		// console.warn(`Divination Card. No artFilename ${this.name}`);
		return '';
	}
	return `/images/cards/avif/${artFilename}.avif`;
	// return `https://web.poecdn.com/image/divination-card/${artFilename}.png`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divination-card': DivinationCardElement;
	}
}
