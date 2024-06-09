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
		padding: 0.5rem;
		border: 1px solid rgba(160, 160, 160, 0.2);
		text-align: center;
		@media (width >=460px) {
			padding: 1rem;
		}
	}

	.header-with-icon {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.4rem;
	}

	.td-weight {
		font-weight: 600;
		font-size: 17px;
		@media (width >=460px) {
			font-size: 18px;
		}
	}

	.ordered-by {
		color: yellow;
	}
`;
