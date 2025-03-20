import { css } from 'lit';
import { linkStyles } from '../linkStyles';

export const styles = css`
	* {
		padding: 0;
		margin: 0;
		box-sizing: border-box;
		font-family: 'Geist';
	}

	@layer links {
		${linkStyles}
	}

	.join-divcord {
		font-size: 1rem;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		&:link {
			text-decoration: underline;
		}
	}

	e-sheets-link {
		margin-top: 0.5rem;
		font-size: 1rem;
	}

	.page {
		font-size: 14px;
	}

	.load {
		margin-top: 1rem;
	}

	.load_btn-and-status {
		display: flex;
		align-items: center;
		padding: 1rem;
		gap: 1rem;
	}

	.load_tip {
		display: block;
		max-width: 450px;
	}

	.search {
		max-width: 400px;
		margin-top: 2rem;
	}

	.active-view {
		margin-top: 1rem;
	}

	.select-view-controls {
		margin-top: 2rem;
	}

	.select-filters-section {
		margin-top: 1rem;
		display: grid;
		gap: 1rem;
	}

	.select-filters-section--open {
		margin-top: 3rem;
	}

	.select-filters {
		display: grid;
		gap: 1rem;
	}

	e-card-with-divcord-records::part(card) {
		margin-inline: auto;
		@media (width >= 460px) {
			margin-inline: 0;
		}
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 3rem;
		margin-top: 2rem;
		list-style: none;
	}
`;
