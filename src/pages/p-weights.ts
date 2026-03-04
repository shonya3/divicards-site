import { computed, signal, SignalWatcher } from "@lit-labs/signals";
import { consume } from "@lit/context";
import { LitElement, html, css, TemplateResult, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

import "@shoelace-style/shoelace/dist/components/details/details.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";

import { use_local_storage } from "../composables/use_local_storage";
import {
  view_transition_names_context,
  type ViewTransitionNamesContext,
} from "../context/view-transition-name-provider";
import { Sources } from "../DivcordTable";
import "../elements/e-discord-avatar";
import "../elements/weights-table/e-weights-table";
import { calculateRootMargin } from "../elements/weights-table/intersectionUtils";
import { prepare_rows } from "../elements/weights-table/lib";
import { poeData } from "../PoeData";
import { divcord_store } from "../stores/divcord";
import { formatWithNewlines } from "../utils";
import { linkStyles } from "./../linkStyles";

import type { ShowLimitChangeEvent, WeightsTableElement } from "../elements/weights-table/e-weights-table";

declare module "../storage" {
  interface Registry {
    weightsPageShowCards: boolean;
  }
}

const faq = [
  {
    q: `Do we "know"  that Rain of Chaos "actually" weighs ~121000?`,
    a: `Yes.
        
The original Rain of Chaos natural weight value estimate was based on tracking index items of known weight (e.g. Active Skill Gems) in large samples. Since we know those index items' exact DropPool weights, the estimate was pretty good.

The rough size of that value was reverified in 3.22 by a few of us carefully counting thousands of natural Card drops and index items in T16 Castle Ruins.

Sampling indicated that the true value may be slightly lower, but it's quite close. Since past estimates were normalized to 121400, to make comparisons to prior leagues easier, most people just stick with that value even if it may be slightly high.

<a target="_blank" href="https://discord.com/channels/991073626721763429/991092200957952152/1244892691192479795">tikiheme (poorFishwife) — 28/05/2024 08:59</a>
`,
  },
];

/**
 * @csspart active_divination_card
 */
@customElement("p-weights")
export class WeightsPage extends SignalWatcher(LitElement) {
  @consume({ context: view_transition_names_context, subscribe: true })
  @state()
  view_transition_names!: ViewTransitionNamesContext;

  #show_cards = use_local_storage("weightsPageShowCards", false);
  #rows = prepare_rows();

  #intersected_card = signal<string | null>(null);
  #intersected_card_sources = computed<Sources | null>(() => {
    const card = this.#intersected_card.get();
    if (!card) return null;
    return divcord_store.get_card_sources(card);
  });

  #onShowCardsChanged(e: Event) {
    const target = e.target as WeightsTableElement;
    this.#show_cards.set(target.showCards);
  }

  private _intersectedRowObserver: IntersectionObserver | null = null;
  #handleShowLimitChange(e: ShowLimitChangeEvent) {
    // 0. Do nothing if no table rows.
    const firstRow = e.$tableRows.at(0);
    if (!firstRow) {
      return;
    }

    // 1. Do not observe if viewport width(or height) is too small.
    const VIEWPORT_XL_BREAKPOINT = 1280;
    if (window.innerWidth < VIEWPORT_XL_BREAKPOINT || (e.$limit !== null && e.$limit < 25)) {
      this._intersectedRowObserver?.disconnect();
      this._intersectedRowObserver = null;
      this.#intersected_card.set(null);
      return;
    }

    // 2. Do nothing if already observing.
    if (this._intersectedRowObserver) {
      return;
    }

    // 3. Set observer.
    const INTERSECTING_LINE_THICKNESS_PX = 1;

    const { rootMargin, distance } = calculateRootMargin({
      verticalPositionPx: firstRow.getBoundingClientRect().y + window.scrollY,
      thicknessPx: INTERSECTING_LINE_THICKNESS_PX,
    });
    this.style.setProperty("--intersecting-line-top", `${distance.topPx}px`);

    this._intersectedRowObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.part.add("intersecting-row");

            const card = (entry.target as HTMLTableRowElement).dataset.card;
            if (!card) {
              console.error(`Intersecting row <tr>. Expected data-card attribute, found nothing`, entry.target);
              return;
            }
            this.#intersected_card.set(card);
          } else {
            entry.target.part.remove("intersecting-row");
          }
        });
      },
      { rootMargin },
    );

    e.$tableRows.forEach((row) => {
      this._intersectedRowObserver?.observe(row);
    });
  }

  protected render(): TemplateResult {
    const intersectingCard = this.#intersected_card.get();

    return html`<div class="page">
			<h1 class="heading">Weights</h1>
			<main class="main">
				<section class="section-table">
					<h2>Weights Table</h2>
					<p class="weights-spreadsheet-p">
						<sl-icon class="spreadsheet-icon" name="file-earmark-spreadsheet"></sl-icon>
						<a
							target="_blank"
							href="https://docs.google.com/spreadsheets/d/1PmGES_e1on6K7O5ghHuoorEjruAVb7dQ5m7PGrW7t80/edit#gid=272334906"
							>Weights spreadsheet by
						</a>
						<e-discord-avatar username="nerdyjoe"></e-discord-avatar>
					</p>
					<e-weights-table
						@e-weights-table__change-limit=${this.#handleShowLimitChange}
						.active_divination_card=${this.view_transition_names.active_divination_card}
						exportparts="active_divination_card"
						@show-cards-changed=${this.#onShowCardsChanged}
						class="section-table__table"
						ordered-by="weight"
						.showCards=${this.#show_cards.get()}
						.rows=${this.#rows}
					></e-weights-table>

          
          <p class="based-on">
						Based on <strong>${poeData.cards.latestWeightsCollected.totalCards.toLocaleString("en-US")}</strong> cards
            collected in <span class="current-league">${poeData.cards.latestWeightsCollected.version}</span>
					</p>
				</section>
				<div class="links-and-faq">
					<div class="faq">
						<h2>Questions and answers</h2>
						${faq.map(
              (el) =>
                html`<sl-details summary=${el.q}
									><p>${formatWithNewlines(el.a, { escape: false })}</p></sl-details
								>`,
            )}
					</div>

					<article class="section-links">
						<h2>Deep dive</h2>
						<p>For better understanding, read <em>poorFishwife's</em> posts in these reddit threads:</p>
						<ul>
							<li>
								<a
									target="_blank"
									href="https://www.reddit.com/r/pathofexile/comments/vl52b6/comment/idt0ea3/"
									>Hihi reddit! 🐟❤️ What's your favourite Divination Card? Mine is The Vast,
									because...</a
								>
							</li>
							<li>
								<a
									target="_blank"
									href="https://www.reddit.com/r/pathofexile/comments/wsi0j8/complete_divination_card_dropweight_tables_drop/"
									>Complete Divination Card Dropweight Tables, Drop Estimates for New 3.19 Cards, and
									Player IIQ Formula | Prohibited Library Digest</a
								>
							</li>
						</ul>
					</article>

					${
            intersectingCard
              ? html`
								<div>
									<e-divination-card
										class="intersecting-card-presentation"
										size="large"
										name=${intersectingCard}
										.sources=${this.#intersected_card_sources.get()}
									></e-divination-card>
								</div>
							`
              : nothing
          }

					<article>
						<h2>Contribute</h2>
						<p>To contribute to the stacked deck weight project, there are a few simple steps.</p>
						<ol>
              <li>
                Clean out the div card tab so no cards remain.
              </li>
              <li>
                Open all the stacked decks, and put every single card into the tab.
              </li>
							<li>
								Extract your divination cards with
								<a href="https://github.com/shonya3/divicards" target="_blank">the program</a>.
                <p>
                   Be sure that the number of cards recorded by the tool matches
                   the number of stacked decks you opened. It may take some time for GGG to update the card tab, up to around 10 minutes.
                </p>
							</li>
							<li>
								Upload the resulting <strong>.csv</strong> to <strong>#stacked-decks</strong> channel in the
								<a href="https://discord.gg/wttfY5pt" target="_blank">Prohibited Library</a>
								Discord server.
							</li>
						</ol>
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
			justify-content: center;
		}

		.links-and-faq {
			max-width: 60ch;
			display: flex;
			flex-direction: column;
			gap: 3rem;
		}

		.faq {
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

		.based-on {
			margin-top: var(--sl-spacing-large);
			color: var(--sl-color-gray-500);

      & strong {
        color: var(--sl-color-gray-700)
      }
		}

    .current-league {
			color: var(--sl-color-pink-600);
			font-weight: var(--sl-font-weight);
			font-size: var(--sl-font-size-x-large);
		}

		

		/** Intersection */
		e-weights-table::part(intersecting-row) {
			background-color: var(--sl-color-sky-100);
			--td-border-bottom: 1px solid var(--sl-color-sky-400);
		}
		.intersecting-card-presentation {
			position: fixed;
			top: calc(var(--intersecting-line-top) - 100px);
		}
	`;
}

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

    ul,
    ol {
      margin: 1rem;
      padding-left: var(--sl-spacing-small);
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "p-weights": WeightsPage;
  }
}
