import { css } from 'lit';

export const styles = css`
	#root {
		--w-col-id: 50px;
		--w-col-card: 200px;
		--w-col-weight: 80px;
		--w-col-confidence: 80px;
		--w-col-remaining-work: 80px;
		--w-col-sources: 400px;
		--w-col-verify: 320px;
		--w-col-notes: 300px;
		--w-table: calc(
			var(--w-col-id) + var(--w-col-card) + var(--w-col-weight) + var(--w-col-confidence) +
				var(--w-col-remaining-work) + var(--w-col-sources) + var(--w-col-verify) + var(--w-col-notes)
		);

		height: calc(100vh - 70px);
		overflow-y: scroll;
		width: fit-content;
		box-shadow: var(--sl-shadow-large);

		color: #fff;
		--source-color: hsl(240 7.3% 84%);
	}

	a:link,
	a:visited {
		color: hsl(240 5.6% 73%);
		text-decoration: underline;
	}
	a:hover {
	}

	#root {
		width: var(--w-table);
		height: calc(100vh - 150px);
	}

	.table {
		width: var(--w-table);

		border-collapse: collapse;
		table-layout: fixed;
		width: fit-content;
		font-size: 14px;
		position: relative;
		height: 100%;
		background-color: #121212;
	}

	.show-cards-row .td {
		border: none;
		border-right: 1px solid rgba(160, 160, 160, 1);
	}

	.td {
		border-bottom: 1px solid rgba(160, 160, 160, 1);
		border-right: 1px solid rgba(160, 160, 160, 1);
	}

	.th {
		font-weight: unset;
		font-size: 12px;
		border-right: 1px solid rgba(160, 160, 160, 1);
	}

	.th,
	.td {
		padding: 0.4rem;
		text-align: center;
	}

	.tbody {
		width: var(--w-table);

		display: table-row-group;
		transform: translateX(1px);
	}

	.thead__headings {
		position: sticky;
		top: -1px;
		background-color: black;
		z-index: 9999;
	}

	.col-id,
	.col-card,
	.col-weight,
	.col-confidence,
	.col-remaining-work,
	.col-notes {
		background-color: #071924;
	}
	.col-sources {
		background-color: #001b02;
	}
	.col-verify {
		background-color: #000;
	}

	.col-id {
		width: var(--w-col-id);
	}
	.col-card {
		width: var(--w-col-card);
	}
	.col-weight {
		width: var(--w-col-weight);
	}
	.col-confidence {
		width: var(--w-col-confidence);
	}
	.col-remaining-work {
		width: var(--w-col-remaining-work);
	}
	.col-sources {
		width: var(--w-col-sources);
	}
	.col-verify {
		width: var(--w-col-verify);
	}
	.col-notes {
		width: var(--w-col-notes);
		font-size: 13px;
	}
	.col-notes.td {
		text-align: left;
		word-break: break-word;
		color: #bcbcbc;
		width: var(--w-col-notes);
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
		font-size: 16px;
	}

	.ordered-by {
		color: yellow;
	}

	.td-weight__label {
		position: relative;
	}

	.td-weight__label--show-pre-rework-weight::after {
		content: '3.23';
		position: absolute;
		top: 0;
		right: 0;
		transform: translate(-100%, -100%);
		color: pink;
		font-size: 11px;
	}
`;
