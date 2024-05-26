import { linkStyles } from './../../linkStyles';
import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CustomIcon, UsefulResource } from './types';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '../e-discord-avatar';

declare global {
	interface HTMLElementTagNameMap {
		'e-useful-resource': UsefulResourceElement;
	}
}

function CustomHeadingIcon(icon: CustomIcon) {
	switch (icon.kind) {
		case 'image':
			return html`<img slot="icon" width="24" height="24" src=${icon.url} alt=${icon.alt} />`;
		case 'sl-icon':
			return html`<sl-icon class="heading__icon" name=${icon.name}></sl-icon>`;
	}
}

@customElement('e-useful-resource')
export class UsefulResourceElement extends LitElement {
	@property({ type: Object }) resource!: UsefulResource;

	protected render(): TemplateResult {
		return html`<div class="heading">
				${this.resource.icon
					? CustomHeadingIcon(this.resource.icon)
					: html`<sl-icon class="heading__icon color-green" name="file-earmark-spreadsheet"></sl-icon>`}
				<h3><a target="_blank" .href=${this.resource.url}>${this.resource.title}</a></h3>
			</div>
			<div>
				${this.resource.github
					? html`
							<a target="_blank" href=${this.resource.github} class="github"
								>Repo <sl-icon class="github__icon" name="github"></sl-icon
							></a>
					  `
					: nothing}
				${this.resource.seeWebsitePage
					? html`<p>
							<a class="see-page" href=${this.resource.seeWebsitePage.relativeUrl}
								>${this.resource.seeWebsitePage.label}</a
							>
					  </p>`
					: nothing}
			</div>
			${this.resource.discordUsers.length
				? html`<div class="contributors">
						${this.resource.discordUsers.map(u => {
							return html`<e-discord-avatar
								part="discord-user"
								size="24"
								username=${u}
							></e-discord-avatar>`;
						})}
				  </div>`
				: nothing} `;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			border: 1px solid #fff
			width: 350px;

            display: flex;
            flex-direction: column;
            gap: 0.2rem;
		}

		.color-green {
			color: var(--sl-color-green-700);
		}
		.heading {
			display: flex;
			align-items: center;
			gap: 0.4rem;
            margin-bottom: 0.2rem;
		}
		.contributors {
			display: flex;
			flex-wrap: wrap;
            column-gap: 0.8rem;
		}
		.heading__icon {
			min-width: 24px;
			min-height: 24px;
			font-size: 24px;
		}

        .see-page, .github{
        }

        .github{
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }
        .github__icon{
            color: var(--sl-color-gray-800);
        }

		${linkStyles}
	`;
}
