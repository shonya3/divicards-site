import { css } from 'lit';

export const linkStyles = css`
	a:link {
		text-decoration: none;
	}

	a,
	a:visited {
		color: var(--source-color, #bbbbbb);
	}

	a:hover {
		color: var(--link-color-hover, skyblue);
		text-decoration: underline;
	}
`;
