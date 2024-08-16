import { LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Source } from '../gen/Source';
import type { SourceSize } from './e-source/types';
import type { RenderMode } from './types';
import type { VerificationStatus } from '../cards';
import { redispatchTransition } from '../events';

/**
 * @csspart active-source - Dropsource involved in view transitions.
 */
@customElement('e-sources')
export class SourcesElement extends LitElement {
	@property({ type: Array }) sources: Source[] = [];
	@property({ reflect: true }) size: SourceSize = 'small';
	@property({ reflect: true, attribute: 'render-mode' }) renderMode: RenderMode = 'compact';
	@property({ reflect: true, attribute: 'verification-status' }) verificationStatus: VerificationStatus = 'done';
	/** Dropsource involved in view transitions */
	@property({ reflect: true, attribute: 'active-source' }) activeSource?: string;

	protected render(): HTMLUListElement {
		return SourcesList.call(
			this,
			this.sources,
			this.size,
			this.renderMode,
			this.verificationStatus,
			this.activeSource
		);
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

		.sources-maps--verify {
			gap: 0.75rem;
		}
	`;
}

/**  Put maps into distinct container without gaps */
function SourcesList(
	this: HTMLElement,
	sources: Source[],
	size: SourceSize,
	renderMode: RenderMode,
	verificationStatus: VerificationStatus,
	activeSource: string | null = null
): HTMLUListElement {
	const mapsSources = document.createElement('div');
	mapsSources.classList.add('sources-maps');
	if (verificationStatus === 'verify') {
		mapsSources.classList.add('sources-maps--verify');
	}
	const ul = document.createElement('ul');
	ul.classList.add('sources');
	for (const source of sources) {
		{
			let sourceEl: HTMLElement = Object.assign(document.createElement('e-source'), {
				renderMode,
				source,
				size,
			});

			if (activeSource === source.idSlug) {
				sourceEl.setAttribute('part', 'active-source');
			}

			sourceEl.addEventListener('navigate-transition', e => {
				redispatchTransition.call(this, e);
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

declare global {
	interface HTMLElementTagNameMap {
		'e-sources': SourcesElement;
	}
}
