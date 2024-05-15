import { css } from 'lit';
export const styles = css`
	:host {
		display: block;
	}

	.table {
		border-collapse: collapse;
		border: 1px solid rgba(140, 140, 140, 0.3);
	}

	.th {
		font-size: 1.2rem;
	}

	.th,
	.td {
		padding: 1rem;
		border: 1px solid rgba(160, 160, 160, 0.2);
		text-align: center;
	}

	.header-with-icon {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.4rem;
	}

	.td-weight {
		font-weight: 700;
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

	@media (width < 25rem) {
		.th,
		.td {
			padding: 0.4rem;
		}
	}
`;
