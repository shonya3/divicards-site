import { LitElement, html, css, PropertyValueMap, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { startViewTransition } from '../utils';
import { router } from '../router';

declare global {
	interface HTMLElementTagNameMap {
		'e-navbar': NavbarElement;
	}
}

@customElement('e-navbar')
export class NavbarElement extends LitElement {
	@property({ type: Array }) linkItems = [
		['/', 'Home'],
		['/maps', 'Maps'],
		['/sources', 'Sources'],
		['/divcord', 'Divcord'],
		['/verify', 'Need to verify'],
		['/verify-faq', 'faq'],
	];

	@state() pathname = new URL(window.location.href).pathname || '/home';

	@query('#menu') menuDialogElement!: HTMLDialogElement;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('pathname')) {
			this.setAttribute('pathname', this.pathname);

			if (this.menuDialogElement) {
				this.menuDialogElement.close();
			}
		}
	}

	constructor() {
		super();

		router.addEventListener('route-changed', () => {
			startViewTransition(() => {
				const pathname = new URL(window.location.href).pathname;
				this.pathname = pathname || '/home';
			});
		});
	}

	connectedCallback(): void {
		super.connectedCallback();
		const observer = new ResizeObserver(entries => {
			const entry = entries[0];
			if (entry.target.clientWidth > 1100) {
				this.menuDialogElement.close();
			}
		});

		observer.observe(document.body);
	}

	protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
		this.menuDialogElement.showModal();
	}

	protected renderMenu() {
		return html`<dialog id="menu" class="menu">
			<ul class="links">
				${this.linkItems.map(([pathname, s]) => {
					return html`<li
						class=${classMap({
							links__item: true,
							'links__item--active': pathname === this.pathname,
						})}
					>
						<a href="${pathname}">${s}</a>
						${pathname === this.pathname
							? html`<div class="links__active-item-background"></div>`
							: nothing}
					</li>`;
				})}
			</ul>
			<button @click=${() => this.menuDialogElement.close()} class="btn menu__close-button">Close</button>
		</dialog>`;
	}

	protected render() {
		return html`<nav class="navbar">
			<div class="logo"><a href="/">Divicards</a></div>
			<ul class="links">
				${this.linkItems.map(([pathname, s]) => {
					return html`<li
						class=${classMap({
							links__item: true,
							'links__item--active': pathname === this.pathname,
						})}
					>
						<a href=${pathname}>${s}</a>
						${pathname === this.pathname
							? html`<div class="links__active-item-background"></div>`
							: nothing}
					</li>`;
				})}
			</ul>

			<button class="btn menu-button" type="button" @click=${() => this.menuDialogElement.showModal()}>
				Menu
			</button>
			${this.renderMenu()}
		</nav>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		button {
			font: inherit;
		}

		:host {
			--bg-clr: var(--indigo-8, #3b5bdb);
			--clr: #fff;
		}

		.navbar {
			height: 65px;
			background-color: var(--bg-clr);
			color: var(--clr);

			display: flex;
			justify-content: space-around;
			align-items: center;
		}

		.logo {
			margin-left: 10%;
			font-size: 1.8rem;
			margin-right: auto;
		}

		.links {
			list-style: none;
			display: flex;
			margin-right: 10%;
			margin-left: auto;
			gap: 1rem;
			text-transform: uppercase;
		}

		.links__item {
			border-radius: 1rem;
			position: relative;
		}

		.links__item--active {
		}

		.links__active-item-background {
			view-transition-name: active-link;
			position: absolute;
			inset: 0;
			background-color: rgba(255, 255, 255, 0.1);
			border-radius: 1rem;
		}

		a {
			display: block;
			padding-inline: 1rem;
			padding-block: 0.5rem;
			color: var(--clr);
			text-decoration: none;
		}

		.links__item a:hover {
			display: block;
			text-transform: uppercase;
			padding-inline: 1rem;
			padding-block: 0.5rem;
			color: var(--clr);
			text-decoration: none;

			background-color: rgba(255, 255, 255, 0.3);
			border-radius: 1rem;
		}

		.links__item a:active {
			background-color: rgba(255, 255, 255, 0.1);
		}

		.btn {
			color: var(--clr);
			border: none;
			background-color: transparent;
			padding: 1rem;
			cursor: pointer;
		}

		.menu-button {
			display: none;
		}

		.menu__close-button {
			display: none;
		}

		@media (width < 1100px) {
			.links {
				display: none;
			}

			.menu-button {
				display: inline-block;
			}

			dialog:modal {
				inset: 0;
				margin: 0;
				padding: 0;
				width: 100%;
				height: 100vh;
				border: none;
				background-color: var(--bg-clr);
			}

			dialog::backdrop {
				background-color: #3b5bdb;
			}

			.menu > .links {
				display: flex;
				background-color: var(--bg-clr);
				padding: 0;
				margin: 0;
				inset: 0;
				position: absolute;
				top: 10%;
				left: 0;

				flex-direction: column;
				text-align: center;
			}

			.menu__close-button {
				display: inline-block;
				position: absolute;
				right: 0rem;
				top: 0.5rem;
			}
		}
	`;
}
