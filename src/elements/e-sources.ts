import { LitElement, PropertyValues, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Source } from '../gen/Source';
import type { SourceSize } from './e-source/types';
import type { RenderMode } from './types';
import type { VerificationStatus } from '../cards';
import { NavigateTransitionEvent, redispatchTransition } from '../events';
import { ifDefined } from 'lit/directives/if-defined.js';

/**
 * List of drop sources.
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

	/** Only maps sources to render them separately. */
	@state() sources_maps: Array<Source> = [];
	/** All sources but maps. Maps are rendered separately. */
	@state() sources_non_maps: Array<Source> = [];

	protected willUpdate(map: PropertyValues<this>): void {
		if (map.has('sources')) {
			this.sources_maps = this.sources.filter(({ type }) => type === 'Map');
			this.sources_non_maps = this.sources.filter(({ type }) => type !== 'Map');
		}
	}

	protected render(): TemplateResult {
		return html`${this.#list('non_maps')}${this.#list('maps')}`;
	}

	/** Reusable list of sources for maps and for non_maps */
	#list(source_types: 'maps' | 'non_maps'): TemplateResult {
		const sources = source_types === 'maps' ? this.sources_maps : this.sources_non_maps;
		return html`<ul class="${source_types === 'maps' ? 'sources-maps' : 'sources'}">
			${sources.map(source => {
				const source_template = html`
					<e-source
						@navigate-transition=${(e: NavigateTransitionEvent) => redispatchTransition.call(this, e)}
						part=${ifDefined(this.activeSource === source.idSlug ? 'active-source' : undefined)}
						.renderMode=${this.renderMode}
						.source=${source}
						.size=${this.size}
					></e-source>
				`;
				return this.verificationStatus === 'verify'
					? html`<li><e-need-to-verify>${source_template}</e-need-to-verify></li>`
					: html`<li>${source_template}</li>`;
			})}
		</ul>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		ul {
			list-style: none;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
		}

		.sources {
			margin-top: 0.25rem;
			column-gap: 0.5rem;
			row-gap: 0.4rem;
		}

		.sources-maps {
			gap: 0.2rem;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-sources': SourcesElement;
	}
}
