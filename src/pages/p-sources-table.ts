import { LitElement, html, css, PropertyValueMap, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card.js';
import '../elements/divination-card/e-divination-card.js';
import '../elements/e-source.js';
import { poeData } from '../PoeData.js';
import { cardsFinderContext } from '../context.js';
import { CardsFinder, cardsBySourceTypes, sortByWeight } from '../data/CardsFinder.js';
import { consume } from '@lit/context';
import { SourceType, sourceTypes } from '../data/ISource.interface.js';

declare global {
	interface HTMLElementTagNameMap {
		'p-sources-table': SourcesTablePage;
	}
}

@customElement('p-sources-table')
export class SourcesTablePage extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ reflect: true }) filter: string = '';
	@property({ type: Boolean }) showSourceType = true;
	@property() firstColumnName = 'Source';
	@property({ type: Array }) sourceTypes: SourceType[] = Array.from(sourceTypes);

	@consume({ context: cardsFinderContext, subscribe: true })
	cardsFinder!: CardsFinder;

	get records() {
		return this.cardsFinder.divcordTable.records;
	}

	protected willUpdate(_changedProperties: PropertyValueMap<this>): void {
		if (_changedProperties.has('filter')) {
			const url = new URL(window.location.href);

			url.searchParams.set('filter', this.filter);
			window.history.replaceState({}, '', url);
		}
	}

	protected render() {
		return html` ${this.table()} `;
	}

	protected table() {
		const sourcesAndCardsArr = cardsBySourceTypes(this.sourceTypes, this.records, poeData);
		return html`<table>
			<thead>
				<tr>
					<th style="width: 300px" scope="col">
						<slot>Source</slot>
					</th>
					<th scope="col">Cards</th>
				</tr>
			</thead>
			<tbody>
				${sourcesAndCardsArr.map(
					({ source, cards }) =>
						html`
							<tr>
								<td>
									<e-source
										.showSourceType=${this.showSourceType}
										.size=${this.size}
										.source=${source}
									></e-source>
								</td>
								<td>
									<ul>
										${cards.map(({ card, boss }) => {
											sortByWeight(cards, poeData);
											return html`<li>
												<e-divination-card
													.minLevel=${poeData.minLevel(card)}
													.boss=${boss?.id}
													size=${this.size}
													name=${card}
												>
													${boss
														? html`<e-source
																.renderMode=${'compact'}
																.source=${boss}
																slot="boss"
														  ></e-source>`
														: nothing}
												</e-divination-card>
											</li>`;
										})}
									</ul>
								</td>
							</tr>
						`
				)}
			</tbody>
		</table> `;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}
		form {
			padding: 1rem;
			display: grid;
			gap: 0.25rem;
			width: fit-content;
		}

		fieldset {
			padding: 0.8rem;
		}

		header {
			border-bottom: none;
		}
		table {
			min-width: 100%;
			table-layout: fixed;
			border-collapse: collapse;
		}

		tbody tr:nth-child(odd) {
			background-color: #222;
		}

		th {
			font-size: 20px;
			padding: 1rem;
		}

		/*
		th:first-child {
			width: 356px;
		}
        */

		td {
			text-align: center;
		}

		li {
			list-style: none;
		}

		ul {
			padding: 0.4rem;
			display: flex;
			flex-wrap: wrap;
			gap: 0.6rem;
		}
	`;
}
