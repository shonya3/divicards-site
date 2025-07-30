import { LitElement, html, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ThemeToggle } from '../../elements/theme-toggle/theme-toggle';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { router } from '../../router';
import { styles } from './e-topnav.styles';
ThemeToggle.define();

@customElement('e-topnav')
export class TopNavElement extends LitElement {
	static styles = [styles];

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

	@query('#menu') menu!: HTMLDialogElement;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('pathname')) {
			this.setAttribute('pathname', this.pathname);

			if (this.menu) {
				this.menu.close();
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
							: null}
					</li>`;
				})}
			</ul>
			<div class="icons">
				<theme-toggle></theme-toggle>
				<a aria-label="github" target="_blank" href="https://github.com/shonya3/divicards-site">
					<sl-icon name="github"></sl-icon>
				</a>
			</div>

			<a class="btn menu-button" type="button" @click=${() => this.menu.showModal()}> Menu </a>
			<dialog id="menu" class="menu">
				<ul class="links">
					${this.linkItems.map(([pathname, s]) => {
						return html`<li
							class=${classMap({
								links__item: true,
								'links__item--active': pathname === this.pathname,
							})}
						>
							<a @click=${() => this.#change_active_pathname(pathname)} href="${pathname}">${s}</a>
							${pathname === this.pathname
								? html`<div class="links__active-item-background"></div>`
								: null}
						</li>`;
					})}
				</ul>
				<button @click=${() => this.menu.close()} class="btn menu__close-button">Close</button>
			</dialog>
		</nav>`;
	}

	#change_active_pathname(pathname: string) {
		router.update_during_transition = () => {
			this.pathname = pathname;
		};
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'e-topnav': TopNavElement;
	}
}
