import { css } from 'lit';

export const styles = css`
	button {
		font: inherit;
	}

	:host {
		--menu-bg-clr: var(--sl-color-gray-50);
	}

	.navbar {
		max-width: 1440px;
		margin-inline: auto;
		height: 50px;

		display: flex;
		justify-content: space-around;
		align-items: center;
		opacity: 95%;
	}

	a {
		display: block;
		padding-inline: 1rem;
		font-size: 14px;
		padding-block: 0.5rem;
		color: var(--clr);
		text-decoration: none;
	}

	.icons {
		display: flex;
		align-items: center;
		gap: 0rem;
	}

	sl-icon {
		font-size: 1.5rem;

		a {
			all: unset;
		}
	}

	dialog {
		max-width: 100%;
	}

	.logo {
		margin-left: 10%;
		margin-right: auto;

		& a {
			font-size: 1.5rem;
			color: var(--sl-color-gray-950);
		}
	}

	.links {
		list-style: none;
		display: flex;
		margin-right: 10%;
		margin-left: auto;
		gap: 0.2rem;
	}

	.links__item {
		color: var(--sl-color-neutral-700);
		border-radius: 1rem;
		position: relative;
	}

	.links__item--active {
		color: var(--sl-color-gray-900);
	}

	.links__item--active a {
	}

	.links__active-item-background {
		z-index: -1;
		position: absolute;
		inset: 0;
		border-radius: 1rem;
		background-color: var(--sl-color-gray-300);
		background-color: transparent;
		box-shadow: var(--top-nav-active-shadow);
	}

	.links__item a:hover {
		display: block;
		padding-inline: 1rem;
		padding-block: 0.5rem;
		color: var(--clr);
		text-decoration: none;

		background-color: rgba(255, 255, 255, 0.3);
		background-color: var(--sl-color-gray-100);
		border-radius: 1rem;
	}

	.links__item a:active {
		background-color: rgba(255, 255, 255, 0.1);
		background-color: var(--sl-color-gray-400);
	}

	.btn {
		color: var(--clr);
		border: none;
		background-color: transparent;
		padding: 1rem;
	}

	.menu-button {
		display: none;
	}

	.menu__close-button {
		display: none;
	}

	@media (width < 1400px) {
		.links {
			display: none;
		}

		.menu-button {
			display: inline-block;
			margin-right: 2.5rem;
		}

		dialog:modal {
			position: relative;
			inset: 0;
			margin: 0;
			padding: 0;
			width: 100%;
			height: 100vh;
			border: none;
			background-color: var(--menu-bg-clr);
		}

		dialog::backdrop {
			background-color: var(--menu-bg-clr);
		}

		.links__active-item-background {
			border-radius: 0;
		}
		.menu > .links {
			display: flex;
			background-color: var(--menu-bg-clr);
			padding: 0;
			margin: 0;
			inset: 0;
			position: absolute;
			top: 10%;
			left: 0;

			flex-direction: column;
			text-align: center;

			& a {
				font-size: 1.3rem;
			}
		}

		.menu__close-button {
			display: inline-block;
			position: absolute;
			right: 0rem;
			margin-right: 2.5rem;
		}
	}
`;
