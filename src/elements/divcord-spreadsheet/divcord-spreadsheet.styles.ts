import { css } from 'lit';

export const styles = css`
	#root {
		--w-cell-id: 50px;
		--w-cell-card: 185px;
		--w-cell-weight: 80px;
		--w-cell-confidence: 80px;
		--w-cell-remaining-work: 80px;
		--w-cell-sources: 300px;
		--w-cell-verify: 320px;
		--w-cell-notes: 500px;
		--w-table: calc(
			var(--w-cell-id) + var(--w-cell-card) + var(--w-cell-weight) + var(--w-cell-confidence) +
				var(--w-cell-remaining-work) + var(--w-cell-sources) + var(--w-cell-verify) + var(--w-cell-notes)
		);

		--sl-color-gray-300: hsl(240 5% 27.6%);
		--sl-color-gray-400: hsl(240 5% 35.5%);
		--sl-color-gray-500: hsl(240 3.7% 44%);
		--sl-color-gray-600: hsl(240 5.3% 58%);
		--sl-color-gray-700: hsl(240 5.6% 73%);
		--sl-color-gray-800: hsl(240 7.3% 84%);
		--sl-color-gray-900: hsl(240 9.1% 91.8%);
		--sl-color-gray-950: hsl(0 0% 95%);

		--divcord-color-darkblue: #071924;
		--divcord-color-darkgreen: #001b02;
		--divcord-color-black: #000;

		--z-table-header: 2;

		width: fit-content;
		height: calc(100vh - 150px);
		color: var(--sl-color-gray-800);
		overflow-y: scroll;
		box-shadow: var(--sl-shadow-large);
	}

	a:link,
	a:visited {
		color: var(--sl-color-gray-700);
		text-decoration: underline;
	}

	.table {
		width: var(--w-table);
		border-collapse: collapse;
		table-layout: fixed;
		position: relative;
		height: 100%;
		background-color: #121212;
	}

	.thead__headings {
		position: sticky;
		top: 0px;
		background-color: black;
		z-index: var(--z-table-header);
	}

	.th,
	.td {
		padding: 0.2rem;
		text-align: center;
	}

	.th {
		&:not(:last-of-type) {
			border-right: 1px solid rgba(160, 160, 160, 1);
		}

		font-weight: unset;
		font-size: 13px;

		& sl-icon {
			font-size: 1rem;

			&.ordered-by {
				color: yellow;
			}
		}

		& .header-with-icon {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 0.4rem;
		}
	}

	.td {
		&:not(:last-child) {
			border-right: 1px solid rgba(160, 160, 160, 1);
		}

		border-bottom: 1px solid rgba(160, 160, 160, 1);
	}

	.show-cards-row .td {
		border: none;
	}

	.tbody {
		width: var(--w-table);
		display: table-row-group;
	}

	/** Background color */
	.cell-id,
	.cell-card,
	.cell-weight,
	.cell-confidence,
	.cell-remaining-work,
	.cell-notes {
		background-color: var(--divcord-color-darkblue);
	}
	.cell-sources {
		background-color: var(--divcord-color-darkgreen);
	}
	.cell-verify {
		background-color: var(--divcord-color-black);
	}

	/** Column widths */
	.cell-id {
		width: var(--w-cell-id);
	}
	.cell-card {
		width: var(--w-cell-card);
	}
	.cell-weight {
		width: var(--w-cell-weight);
	}
	.cell-confidence {
		width: var(--w-cell-confidence);
	}
	.cell-remaining-work {
		width: var(--w-cell-remaining-work);
	}
	.cell-sources {
		width: var(--w-cell-sources);

		&.td {
			vertical-align: top;
		}
	}
	.cell-verify {
		width: var(--w-cell-verify);

		&.td {
			vertical-align: top;
		}
	}
	.cell-notes {
		width: var(--w-cell-notes);
	}

	.td.cell-weight {
		font-size: 16px;
	}

	/* Confidence */
	.td.cell-confidence {
		text-transform: uppercase;
	}
	.confidence--done {
		background-color: green;
	}
	.confidence--ok {
		background-color: #93c47d;
		color: black;
	}
	.confidence--none {
		background-color: red;
	}
	.confidence--low {
		background-color: #f1c232;
		color: black;
	}

	/* Remaining work */
	.remaining-work--reverify {
		background-color: #9fc5e8;
		color: black;
	}
	.remaining-work--story {
		background-color: #efa7c5;
		color: black;
	}
	.remaining-work--confirm {
		background-color: #f5d379;
		color: black;
	}

	.td.cell-notes {
		width: var(--w-cell-notes);
		color: var(--sl-color-gray-800);
		font-family: monospace;
		vertical-align: top;
		text-align: left;
		word-break: break-word;
	}
`;
