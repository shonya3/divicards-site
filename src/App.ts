import { provide } from '@lit/context';
import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';
import { divcordLoader } from './DivcordLoader';
import { divcordTableContext } from './context';
import { DivcordTable } from './DivcordTable';
import { linkStyles } from './linkStyles';
import { toast } from './toast';
import './elements/e-topnav';

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
	divcordTable!: DivcordTable;

	constructor() {
		super();

		divcordLoader.addEventListener('records-updated', records => {
			this.divcordTable = new DivcordTable(records);
			toast('Your Divcord data is up-to-date', 'success', 3000);
		});
	}

	render(): TemplateResult {
		return html`<div class="wrapper">
			<header class="header">
				<e-topnav></e-topnav>
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
			min-height: 100vh;
			--source-color: var(--sl-color-gray-800);
		}

		.header {
			position: sticky;
			top: 0;
			z-index: 10;
		}

		.outlet {
			padding: 2rem;
			padding-bottom: 0;
		}

		@media (width <= 600px) {
			.outlet {
				margin-top: 1rem;
				padding: 0.5rem;
				padding-bottom: 0;
			}
		}
	`;
}
