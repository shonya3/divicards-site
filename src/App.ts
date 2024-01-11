import { provide } from '@lit/context';
import { LitElement, PropertyValueMap, html, css } from 'lit';
import { customElement, query, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { CardsFinder } from './CardsFinder';
import { divcordService } from './DivcordService';
import { divcordTableContext, cardsFinderContext } from './context';
import { SourcefulDivcordTable } from './divcord';
import { linkStyles } from './linkStyles';
import { toast } from './toast';

declare global {
	interface Document {
		startViewTransition: (cb: (...args: any[]) => any) => Promise<unknown>;
	}

	interface HTMLElementTagNameMap {
		'app-root': RootElement;
	}
}

@customElement('app-root')
export class RootElement extends LitElement {
	@query('.outlet') outlet!: HTMLElement;
	@property() pathname?: string;

	@provide({ context: divcordTableContext })
	@property({ type: Object })
	divcordTable!: SourcefulDivcordTable;

	@provide({ context: cardsFinderContext })
	@state()
	cardsFinder!: CardsFinder;

	protected willUpdate(changedProperties: PropertyValueMap<this>): void {
		if (changedProperties.has('divcordTable')) {
			this.cardsFinder = new CardsFinder(this.divcordTable);
		}
	}

	constructor() {
		super();

		divcordService.on('records-updated', e => {
			this.divcordTable = new SourcefulDivcordTable(e.detail);
			toast('Your Divcord data is up-to-date', 'success', 3000);
		});
	}

	render() {
		const links = [
			['/', 'Home'],
			['/maps', 'Maps'],
			['/sources', 'Sources'],
			['/divcord', 'Divcord'],
		].map(
			([path, label]) => html`
				<li class="navlist_item">
					<a class=${classMap({ 'link--active': path === this.pathname })} href=${path}>${label}</a>
				</li>
			`
		);

		return html`<div class="wrapper">
			<header class="header">
				<nav>
					<ul class="navlist">
						${links}
					</ul>
				</nav>
			</header>
			<div class="outlet"></div>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		@layer base {
			${linkStyles}

			a {
				transition: 0.2s color;
			}
		}

		:host {
			display: block;
			height: 100vh;
			--source-color: #eeeeee;
		}

		.wrapper {
			height: 100vh;
			display: flex;
			flex-direction: column;
		}

		.outlet {
			flex-grow: 1;
			height: 90vh;
		}

		.navlist {
			list-style: none;
			padding: 1rem;

			display: flex;
			gap: 1.5rem;
			background-color: #222;
		}

		.navlist_item {
			font-size: 1.2rem;
		}

		.navlist_item:first-child {
			margin-left: 2rem;
		}

		.link--active {
			color: var(--link-color-hover);
		}

		.outlet > * {
			height: 100%;
			display: block;
			overflow-y: scroll;
		}
	`;
}
