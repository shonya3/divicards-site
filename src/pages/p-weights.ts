import { linkStyles } from './../linkStyles';
import { LitElement, html, css, TemplateResult, PropertyValueMap } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { poeData } from '../PoeData';
import '../elements/weights-table/e-weights-table';
import '../elements/e-discord-avatar';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { Storage } from '../storage';
import type { WeightsTableElement } from '../elements/weights-table/e-weights-table';
import { consume } from '@lit/context';
import { DivcordTable } from '../DivcordTable';
import { divcordTableContext } from '../context';
import { WeightData } from '../elements/weights-table/types';
import { prepareWeightData } from '../elements/weights-table/lib';
import '@shoelace-style/shoelace/dist/components/details/details.js';

declare module '../storage' {
	interface Registry {
		weightsPageShowCards: boolean;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'p-weights': WeightsPage;
	}
}

const faq = [
	{
		q: `Do we "know"  that Rain of Chaos "actually" weighs ~121000?`,
		a: `Yes.
The original Rain of Chaos natural weight value estimate was based on tracking index items of known weight (e.g. Active Skill Gems) in large samples. Since we know those index items' exact DropPool weights, the estimate was pretty good.
The rough size of that value was reverified in 3.22 by a few of us carefully counting thousands of natural Card drops and index items in T16 Castle Ruins.
Sampling indicated that the true value may be slightly lower, but it's quite close. Since past estimates were normalized to 121400, to make comparisons to prior leagues easier, most people just stick with that value even if it may be slightly high.`,
	},
];

@customElement('p-weights')
export class WeightsPage extends LitElement {
	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	#showCardsStorage = new Storage('weightsPageShowCards', false);
	@state() rows: Array<WeightData> = [];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			this.rows = Object.values(poeData.cards).map(prepareWeightData);
			this.rows.sort((a, b) => b.weight - a.weight);
		}
	}

	#onShowCardsChanged(e: Event) {
		const target = e.target as WeightsTableElement;
		this.#showCardsStorage.save(target.showCards);
	}

	protected render(): TemplateResult {
		return html`<div class="page">
			<h1 class="heading">Weights</h1>
			<p class="weights-spreadsheet-p">
				<sl-icon class="spreadsheet-icon" name="file-earmark-spreadsheet"></sl-icon>
				<a
					href="https://docs.google.com/spreadsheets/d/1PmGES_e1on6K7O5ghHuoorEjruAVb7dQ5m7PGrW7t80/edit#gid=272334906"
					>Weights spreadsheet by
				</a>
				<e-discord-avatar size="40" username="nerdyjoe"></e-discord-avatar>
			</p>
			<main class="main">
				<section class="section-table">
					<h2>Weights Table</h2>
					<e-weights-table
						@show-cards-changed=${this.#onShowCardsChanged}
						class="section-table__table"
						ordered-by="weight"
						.showCards=${this.#showCardsStorage.load()}
						.rows=${this.rows}
					></e-weights-table>
				</section>
				<div class="links-and-faq">
					<div class="faq">
						<h2>Questions and answers</h2>
						${faq.map(el => html`<sl-details summary=${el.q}>${el.a}</sl-details>`)}
					</div>

					<article class="section-links">
						<h2>Deep dive</h2>
						<p>For better understanding, read <em>poorFishwife's</em> posts in these reddit threads:</p>
						<ul>
							<li>
								<a href="https://www.reddit.com/r/pathofexile/comments/vl52b6/comment/idt0ea3/"
									>Hihi reddit! 🐟❤️ What's your favourite Divination Card? Mine is The Vast,
									because...</a
								>
							</li>
							<li>
								<a
									href="https://www.reddit.com/r/pathofexile/comments/wsi0j8/complete_divination_card_dropweight_tables_drop/"
									>Complete Divination Card Dropweight Tables, Drop Estimates for New 3.19 Cards, and
									Player IIQ Formula | Prohibited Library Digest</a
								>
							</li>
						</ul>
					</article>
				</div>
			</main>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		${linkStyles}
		${articleCss()}
		a:link {
			text-decoration: underline;
		}

		.page {
			margin-inline: auto;
			max-width: 1400px;
		}

		.main {
			margin-top: 2rem;
			display: flex;
			flex-wrap: wrap;
			gap: 6rem;
		}

		.links-and-faq {
			max-width: 70ch;
			display: flex;
			flex-direction: column;
			gap: 6rem;
		}

		.faq {
			width: 70ch;
			& > h2 {
				margin-bottom: 2rem;
			}
		}

		.heading {
			text-align: center;
			margin-bottom: 3rem;
		}

		.section-table__table {
			margin-top: 0.4rem;
		}

		.weights-spreadsheet-p {
			display: flex;
			align-items: center;
			gap: 0.4rem;
		}

		.spreadsheet-icon {
			color: var(--sl-color-green-700);
		}
	`;
}

// https://docs.google.com/spreadsheets/d/1PmGES_e1on6K7O5ghHuoorEjruAVb7dQ5m7PGrW7t80/edit#gid=272334906

export function articleCss() {
	return css`
		article {
			max-width: min(60ch, calc(100% - 3rem));
			font-size: 18px;
		}

		a:link,
		a:visited {
			color: var(--sl-color-gray-800);
		}

		a:hover {
			color: var(--link-color-hover, skyblue);
			text-decoration: underline;
		}

		h2,
		h3 {
			margin-bottom: 1.5rem;
		}

		ul {
			margin: 1rem;
		}

		p,
		li,
		em {
			color: var(--sl-color-gray-700);
		}

		em {
			color: var(--sl-color-gray-950);
			font-size: 20px;
		}

		img {
			max-width: 100%;
		}

		nav {
			max-width: fit-content;

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
	`;
}
