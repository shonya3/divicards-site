import { LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Source } from '../gen/Source';
import type { SourceSize } from './e-source/types';
import type { RenderMode } from './types';
import type { VerificationStatus } from '../cards';

declare global {
	interface HTMLElementTagNameMap {
		'e-sources': SourcesElement;
	}
}

@customElement('e-sources')
export class SourcesElement extends LitElement {
	@property({ type: Array }) sources: Source[] = [];
	@property({ reflect: true }) size: SourceSize = 'small';
	@property({ reflect: true, attribute: 'render-mode' }) renderMode: RenderMode = 'compact';
	@property({ reflect: true, attribute: 'verification-status' }) verificationStatus: VerificationStatus = 'done';

	protected render(): HTMLUListElement {
		return SourcesList(this.sources, this.size, this.renderMode, this.verificationStatus);
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		.sources {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			margin-top: 0.25rem;
			column-gap: 0.5rem;
			row-gap: 0.4rem;
		}

		.sources-maps {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 0.2rem;
		}
	`;
}

/**  Put maps into distinct container without gaps */
function SourcesList(
	sources: Source[],
	size: SourceSize,
	renderMode: RenderMode,
	verificationStatus: VerificationStatus
): HTMLUListElement {
	const mapsSources = document.createElement('div');
	mapsSources.classList.add('sources-maps');
	const ul = document.createElement('ul');
	ul.classList.add('sources');
	for (const source of sources) {
		{
			let sourceEl: HTMLElement = Object.assign(document.createElement('e-source'), {
				renderMode,
				source,
				size,
			});

			if (verificationStatus === 'verify') {
				const verifyEl = document.createElement('e-need-to-verify');
				verifyEl.append(sourceEl);
				sourceEl = verifyEl;
			}

			if (source.type === 'Map') {
				mapsSources.append(sourceEl);
			} else {
				ul.append(sourceEl);
			}
		}
	}

	if (mapsSources.children.length > 0) {
		ul.append(mapsSources);
	}

	return ul;
}
