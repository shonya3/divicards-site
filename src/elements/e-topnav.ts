import { LitElement, html, css, PropertyValueMap, nothing, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { startViewTransition } from '../utils';
import { router } from '../router';
import { ThemeToggle } from './theme-toggle/theme-toggle';
ThemeToggle.define();

declare global {
	interface HTMLElementTagNameMap {
		'e-topnav': TopNavElement;
	}
}

@customElement('e-topnav')
export class TopNavElement extends LitElement {
	@property({ type: Array }) linkItems = [
		['/', 'Home'],
		['/divcord', 'Divcord'],
		['/verify', 'Need to verify'],
		['/useful-resources', 'Useful Resources'],
		['/weights', 'Weights'],
		['/verify-faq', 'faq'],
		['/sources', 'Sources'],
		['/maps', 'Maps'],
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

	protected render(): TemplateResult {
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
			<theme-toggle></theme-toggle>

			<button class="btn menu-button" type="button" @click=${() => this.menuDialogElement.showModal()}>
				Menu
			</button>
			<dialog id="menu" class="menu">
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
			</dialog>
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

		theme-toggle {
			margin-right: 1rem;
		}

		:host {
			--menu-bg-clr: var(--sl-color-gray-50);
			--clr: var(--sl-color-gray-800);
		}

		a {
			display: block;
			padding-inline: 1rem;
			padding-block: 0.5rem;
			color: var(--clr);
			text-decoration: none;
		}

		.navbar {
			height: 50px;
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
			gap: 0.2rem;
		}

		.links__item {
			border-radius: 1rem;
			position: relative;
		}

		.links__item--active {
			color: var(--sl-color-gray-900);
			z-index: 10;
		}

		.links__item--active a {
		}

		.links__active-item-background {
			view-transition-name: active-link;
			position: absolute;
			inset: 0;
			border-radius: 1rem;
			background-color: var(--sl-color-gray-300);
			background-color: transparent;
			box-shadow: var(--top-nav-active-shadow);
		}

		.links__item a:hover {
			display: block;
			padding-inline: 1rem;
			padding-block: 0.5rem;
			color: var(--clr);
			text-decoration: none;

			background-color: rgba(255, 255, 255, 0.3);
			background-color: var(--sl-color-gray-300);
			border-radius: 1rem;
		}

		.links__item a:active {
			background-color: rgba(255, 255, 255, 0.1);
			background-color: var(--sl-color-gray-400);
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
				margin-right: 2.5rem;
			}

			dialog:modal {
				inset: 0;
				margin: 0;
				padding: 0;
				width: 100%;
				height: 100vh;
				border: none;
				background-color: var(--menu-bg-clr);
			}

			dialog::backdrop {
				background-color: var(--menu-bg-clr);
			}

			.menu > .links {
				display: flex;
				background-color: var(--menu-bg-clr);
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
