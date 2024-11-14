import { css } from 'lit';

export const linkStyles = css`
	a {
		text-underline-offset: 2px;
	}

	:where(a:link) {
		text-decoration: none;
	}

	:where(a:link, a:visited) {
		color: var(--sl-color-gray-700);
	}

	:where(a:hover) {
		color: var(--link-color-hover, skyblue);
		text-decoration: underline;
	}
`;
