import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../elements/e-sheets-link';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { DiscordUsername } from '../gen/avatars';

declare global {
	interface HTMLElementTagNameMap {
		'p-useful-resources': UsefulResourcesPage;
	}
}

type Data = {
	url: string;
	title: string;
	discordUsers: DiscordUsername[];
	github?: string;
	icon?: CustomIcon;
};

type CustomIcon = { kind: 'image'; url: string; alt: string } | { kind: 'sl-icon'; name: string };

const RESOURCES_DATA: Record<string, Data> = {
	divcord: {
		url: 'https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/edit?pli=1#gid',
		title: 'Divcord Spreadsheet',
		discordUsers: [],
		github: 'https://github.com/shonya3/divicards/tree/main/divcord',
	},

	weights: {
		url: 'https://docs.google.com/spreadsheets/d/1PmGES_e1on6K7O5ghHuoorEjruAVb7dQ5m7PGrW7t80/edit#gid=272334906',
		title: 'Weights Spreadsheet',
		discordUsers: ['nerdyjoe'],
		github: '',
	},

	bestDivMapFavourites: {
		url: 'https://docs.google.com/spreadsheets/d/1CuD3Fgxte6fNaP0DoxkqSXfW2BkAXmJ7krNSS5k8Qxk/edit#gid=178188933',
		title: 'Favourite maps with Divination Scarab of Curation',
		discordUsers: ['nerdyjoe'],
		github: 'https://github.com/nerdyjoe314/divinationscarabs',
	},

	mapsofexile: {
		url: 'https://mapsofexile.com/',
		title: 'Maps of Exile',
		discordUsers: ['deathbeam'] as DiscordUsername[],
		github: 'https://github.com/deathbeam/maps-of-exile',
		icon: {
			kind: 'image',
			url: 'https://mapsofexile.com/favicon.png',
			alt: 'Maps of Exile',
		},
	},
} as const;

// <li>
// 	$
// 	{Object.values(OTHER_DATA).map(data => {
// 		return html`<div>
// 			<img width="24" height="24" src="https://mapsofexile.com/favicon.png" alt="Maps of Exile" />
// 			<a href=${data.url}>${data.title}</a>
// 			${data.github
// 				? html` <a href=${data.github} class="github">Repo <sl-icon name="github"></sl-icon></a> `
// 				: nothing}
// 		</div>`;
// 	})}
// </li>;

@customElement('p-useful-resources')
export class UsefulResourcesPage extends LitElement {
	protected render(): TemplateResult {
		return html`<article>
			<h2>Useful resources</h2>

			<section id="section-spreadsheets">
				<ul class="list-resources">
					${Object.values(RESOURCES_DATA).map(data => {
						return html`<li>
							<e-sheets-link .discordUsers=${data.discordUsers} href=${data.url}>
								${data.title} ${data.icon ? this.CustomIcon(data.icon) : nothing}
							</e-sheets-link>
							${data.github
								? html`
										<a href=${data.github} class="github">Repo <sl-icon name="github"></sl-icon></a>
								  `
								: nothing}
						</li>`;
					})}
				</ul>
			</section>
		</article>`;
	}

	CustomIcon(icon: CustomIcon) {
		switch (icon.kind) {
			case 'image':
				return html`<img slot="icon" width="24" height="24" src=${icon.url} alt=${icon.alt} />`;
			case 'sl-icon':
				throw new Error('Not yet implemented');
		}
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

		.list-resources {
			display: flex;
			flex-direction: column;
			gap: 2rem;
			list-style: none;
		}

		e-sheets-link::part(discord-user) {
			font-size: 1rem;
		}
	`;
}
