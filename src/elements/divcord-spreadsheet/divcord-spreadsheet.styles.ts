import { css } from 'lit';

export const styles = css`
	#root {
		padding-top: 2rem;
		height: calc(100vh - 100px);
		overflow-y: scroll;
		width: fit-content;
	}

	.table {
		border-collapse: collapse;
		border: 1px solid rgba(140, 140, 140, 0.3);
		table-layout: fixed;
		width: 1250px;
		font-size: 14px;
		position: relative;
	}

	.tbody {
		width: 1500px;
		display: table-row-group;
		transform: translateX(-1px);
	}

	.thead__headings {
		position: sticky;
		top: -40px;
		background-color: black;
		z-index: 9999;
	}

	.col-id.td {
		border-left: none;
	}

	.col-verify.td {
		border-right: none;
	}

	.col-id {
		width: 100px;
	}
	.col-card {
		width: 200px;
	}
	.col-weight {
		width: 100px;
	}
	.col-tag {
		word-break: break-word;
		width: 200px;
	}
	.col-confidence {
		width: 100px;
	}
	.col-remaining-work {
		width: 100px;
	}
	.col-sources {
		width: 400px;
	}
	.col-verify {
		width: 300px;
	}

	.sources {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		margin-top: 0.25rem;
		column-gap: 0.5rem;
	}

	.sources-maps {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}

	.confidence {
		position: relative;
		text-transform: uppercase;
		font-size: 13px;
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

	.th {
		font-size: 14px;
	}

	.th,
	.td {
		padding: 0.4rem;
		border: 1px solid rgba(160, 160, 160, 0.2);
		text-align: center;
	}

	.col-card.td:not(:has(e-divination-card)) {
		padding-block: 2.5rem;
	}

	.header-with-icon {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.4rem;
	}

	.td-notes {
		text-align: left;
	}

	.td-weight {
		font-weight: 700;
		font-size: 20px;
	}

	.ordered-by {
		color: yellow;
	}

	@media (width < 25rem) {
		.th,
		.td {
			padding: 0.4rem;
		}
	}
`;
