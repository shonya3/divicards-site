import { css } from 'lit';

export const styles = css`
	#root {
		--w-col-id: 100px;
		--w-col-card: 200px;
		--w-col-weight: 100px;
		--w-col-tag: 200px;
		--w-col-confidence: 110px;
		--w-col-remaining-work: 100px;
		--w-col-sources: 400px;
		--w-col-verify: 320px;
		--w-col-notes: 300px;
		--w-table: calc(
			var(--w-col-id) + var(--w-col-card) + var(--w-col-weight) + var(--w-col-tag) + var(--w-col-confidence) +
				var(--w-col-remaining-work) + var(--w-col-sources) + var(--w-col-verify) + var(--w-col-notes)
		);

		height: calc(100vh - 70px);
		overflow-y: scroll;
		width: fit-content;
		box-shadow: var(--sl-shadow-large);

		color: #fff;
		--source-color: hsl(240 7.3% 84%);
	}

	#root {
		height: calc(100vh - 150px);
	}

	.th {
		font-size: 14px;
	}

	.th,
	.td {
		padding: 0.4rem;
		border: 1px solid rgba(160, 160, 160, 0.4);
		text-align: center;
		border-collapse: collapse;
	}

	.table {
		border-collapse: collapse;
		border: 1px solid rgba(140, 140, 140, 0.4);
		table-layout: fixed;
		width: fit-content;
		font-size: 14px;
		position: relative;
		height: 100%;
		background-color: #121212;
	}

	.tbody {
		width: var(--w-table);
		display: table-row-group;
		transform: translateX(-1px);
		border-collapse: collapse;
	}

	.thead__headings {
		position: sticky;
		top: -1px;
		background-color: black;
		z-index: 9999;
	}

	.col-id.td {
		border-left: none;
	}

	.col-verify.td {
		border-right: none;
	}

	.col-id,
	.col-card,
	.col-weight,
	.col-tag,
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
		width: 320px;
	}
	.col-notes {
		width: 300px;
	}
	.col-notes.td {
		text-align: left;
		word-break: break-word;
		color: #bcbcbc;
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
		font-weight: 600;
		font-size: 20px;
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

	e-weight-value {
		display: block;
	}
`;
