import { css } from 'lit';

export const linkStyles = css`
	a {
		text-underline-offset: 2px;
	}

	:where(a:link) {
		text-decoration: none;
	}

	a:link,
	a:visited {
		color: var(--sl-color-gray-800);
	}

	a:hover {
		color: var(--link-color-hover, skyblue);
		text-decoration: underline;
	}
`;
