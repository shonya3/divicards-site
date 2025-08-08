import { css } from 'lit';
export const styles = css`
	:host {
		display: block;
	}

	.table {
		border-collapse: collapse;
	}

	.th,
	.td {
		padding: var(--sl-spacing-x-small);
		border-bottom: 1px solid rgba(160, 160, 160, 0.2);
		text-align: center;

		@media (width >= 460px) {
			padding: var(--sl-spacing-medium);
		}
	}

	.header-with-icon {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--sl-spacing-x-small);
	}

	.td-weight {
		font-weight: 600;
		font-size: 17px;
		@media (width >=460px) {
			font-size: 18px;
		}
	}

	/*
	 * This invisible span is a layout helper. It sits in the normal document flow
	 * to ensure the table cell has enough width to contain the (non-wrapping) card name.
	 */
	.card-name-sizer {
		font-family: 'fontin';
		visibility: hidden;
		white-space: nowrap;
		/* Match horizontal padding of other cells for correct width calculation */
		padding: var(--sl-spacing-x-small);

		@media (width >= 460px) {
			padding: var(--sl-spacing-medium);
		}
	}

	.td-card {
		&:hover {
			background-color: var(--sl-color-teal-50);
		}

		&:has(e-divination-card[appearance='link']) {
			position: relative;
		}

		&:has(e-divination-card[appearance='card']) {
			padding: 0.5rem;

			@media (width >= 460px) {
				padding-inline: var(--sl-spacing-medium);
			}
		}
	}

	e-divination-card::part(link) {
		position: absolute;
		inset: 0rem;

		display: flex;
		align-items: center;
		padding-inline: var(--sl-spacing-x-small);

		@media (width >= 460px) {
			padding-inline: var(--sl-spacing-medium);
		}
	}

	sl-icon {
		color: var(--sl-color-gray-900);
	}

	.ordered-by {
		color: var(--sl-color-yellow-700);
	}
`;
