import { LitElement, html, css, PropertyValueMap, nothing, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { startViewTransition } from '../utils';
import { ThemeToggle } from './theme-toggle/theme-toggle';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
ThemeToggle.define();

@customElement('e-topnav')
export class TopNavElement extends LitElement {
	@property({ type: Array }) linkItems = [
		['/', 'Home'],
		['/weights', 'Weights'],
		['/divcord', 'Divcord'],
		['/verify', 'Verify'],
		['/useful-resources', 'Useful Resources'],
		['/sources', 'Sources'],
		['/maps', 'Maps'],
	];

	@state() pathname = new URL(window.location.href).pathname || '/';

	@query('#menu') menuDialogElement!: HTMLDialogElement;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('pathname')) {
			this.setAttribute('pathname', this.pathname);

			if (this.menuDialogElement) {
				this.menuDialogElement.close();
			}
		}
	}

	protected render(): TemplateResult {
		return html`<nav class="navbar">
			<div class="logo"><a @click=${() => this.#change_active_pathname('/')} href="/">Divicards</a></div>
			<ul class="links">
				${this.linkItems.map(([pathname, s]) => {
					return html`<li
						@click=${() => this.#change_active_pathname(pathname)}
						class=${classMap({
							links__item: true,
							'links__item--active': pathname === this.pathname,
						})}
					>
						<a href=${pathname}>${s}</a>
						${pathname === this.pathname
							? html`<div part="active-link" class="links__active-item-background"></div>`
							: nothing}
					</li>`;
				})}
			</ul>
			<div class="icons">
				<theme-toggle></theme-toggle>
				<a aria-label="github" target="_blank" href="https://github.com/shonya3/divicards-site">
					<sl-icon name="github"></sl-icon>
				</a>
			</div>

			<button class="btn menu-button" type="button" @click=${() => this.menuDialogElement.showModal()}>
				Menu
			</button>
			<dialog id="menu" class="menu">
				<ul class="links">
					${this.linkItems.map(([pathname, s]) => {
						return html`<li
							@click=${() => this.#change_active_pathname(pathname)}
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

	async #change_active_pathname(pathname: string) {
		// Skip frame, because there is autofocussed search input.
		// And it does not play well with the view transition.
		if (this.pathname === '/') {
			await new Promise(requestAnimationFrame);
		}
		startViewTransition(() => {
			this.pathname = pathname;
		});
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
			--menu-bg-clr: var(--sl-color-gray-50);
			--clr: var(--sl-color-gray-700);
		}

		.navbar {
			max-width: 1440px;
			margin-inline: auto;
			height: 50px;
			background-color: var(--bg-clr);
			color: var(--clr);

			display: flex;
			justify-content: space-around;
			align-items: center;
			opacity: 95%;
			border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		}

		a {
			display: block;
			padding-inline: 1rem;
			font-size: 14px;
			padding-block: 0.5rem;
			color: var(--clr);
			text-decoration: none;
		}

		.icons {
			display: flex;
			align-items: center;
			gap: 0rem;
		}

		sl-icon {
			font-size: 1.5rem;

			a {
				all: unset;
			}
		}

		dialog {
			max-width: 100%;
		}

		.logo {
			margin-left: 10%;
			margin-right: auto;

			& a {
				font-size: 1.5rem;
				color: var(--sl-color-gray-950);
			}
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

		@media (width < 1400px) {
			.links {
				display: none;
			}

			.menu-button {
				display: inline-block;
				margin-right: 2.5rem;
			}

			dialog:modal {
				position: relative;
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

			.links__active-item-background {
				border-radius: 0;
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

				& a {
					font-size: 1.3rem;
				}
			}

			.menu__close-button {
				display: inline-block;
				position: absolute;
				right: 0rem;
				margin-right: 2.5rem;
			}
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-topnav': TopNavElement;
	}
}
