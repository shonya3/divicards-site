import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../elements/e-sheets-link';
import { DiscordUsername } from '../gen/avatars';

declare global {
	interface HTMLElementTagNameMap {
		'p-useful-resources': UsefulResourcesPage;
	}
}

const SPREADSHEETS_DATA = {
	divcord: {
		url: 'https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/edit?pli=1#gid',
		title: 'Divcord Spreadsheet',
		discordUsers: [],
	},

	weights: {
		url: 'https://docs.google.com/spreadsheets/d/1PmGES_e1on6K7O5ghHuoorEjruAVb7dQ5m7PGrW7t80/edit#gid=272334906',
		title: 'Weights Spreadsheet',
		discordUsers: ['nerdyjoe'] as DiscordUsername[],
	},

	bestDivMapFavourites: {
		url: 'https://docs.google.com/spreadsheets/d/1CuD3Fgxte6fNaP0DoxkqSXfW2BkAXmJ7krNSS5k8Qxk/edit#gid=178188933',
		title: 'Favourite maps with Divination Scarab of Curation',
		discordUsers: ['nerdyjoe'] as DiscordUsername[],
	},
} as const;

@customElement('p-useful-resources')
export class UsefulResourcesPage extends LitElement {
	protected render(): TemplateResult {
		return html`<article>
			<h2>Useful resources</h2>

			<section id="section-spreadsheets">
				<h2>Spreadsheets</h2>
				<ul>
					${Object.values(SPREADSHEETS_DATA).map(spreadsheet => {
						return html`<li>
							<e-sheets-link .discordUsers=${spreadsheet.discordUsers} href=${spreadsheet.url}>
								${spreadsheet.title}
							</e-sheets-link>
						</li>`;
					})}
				</ul>
			</section>
		</article>`;
	}

	static styles = css`
		article {
			max-width: min(47ch, calc(100% - 3rem));
			margin-inline: auto;
			font-size: 18px;
			margin-bottom: 12rem;
		}

		a:link,
		a:visited {
			color: rgba(255, 255, 255, 0.85);
		}

		a:hover {
			color: var(--link-color-hover, skyblue);
			text-decoration: underline;
		}

		p,
		li,
		em {
			color: rgba(255, 255, 255, 0.75);
		}

		em {
			color: rgba(255, 255, 255, 0.95);
			font-size: 20px;
		}

		section {
			margin-top: 4rem;
		}

		section:not(:first-of-type) {
			margin-top: 6rem;
		}

		img {
			max-width: 100%;
		}

		nav {
			max-width: fit-content;
			border: 2px solid rgba(255, 255, 255, 0.2);

			margin-top: 2rem;
			padding-left: 1rem;
			padding-right: 4rem;
		}

		@media (width < 425px) {
			nav {
				padding-inline: 0.4rem;
			}

			ol {
				padding: 2rem;
			}
		}

		nav a {
			text-decoration: none;
		}

		nav ol {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
		}

		nav h3 {
			margin-left: 0.4rem;
		}

		.with-avatar {
			display: flex;
			align-items: center;
			gap: 0.2rem;
		}
	`;
}
