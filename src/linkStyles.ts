import { css } from 'lit';

export const linkStyles = css`
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
