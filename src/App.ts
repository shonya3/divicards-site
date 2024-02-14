import { provide } from '@lit/context';
import { LitElement, PropertyValueMap, html, css } from 'lit';
import { customElement, query, property, state } from 'lit/decorators.js';
import { CardsFinder } from './CardsFinder';
import { divcordService } from './DivcordService';
import { divcordTableContext, cardsFinderContext } from './context';
import { SourcefulDivcordTable } from './divcord';
import { linkStyles } from './linkStyles';
import { toast } from './toast';
import './elements/e-navbar';

declare global {
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
		return html`<div class="wrapper">
			<header class="header">
				<e-navbar></e-navbar>
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

		.outlet > * {
			height: 100%;
			display: block;
			overflow-y: scroll;
		}
	`;
}
