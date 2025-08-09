import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Source } from '../../gen/Source';
import type { SourceSize } from './e-source/types';
import type { RenderMode } from './types';
import type { VerificationStatus } from '../cards';
import { ifDefined } from 'lit/directives/if-defined.js';
import './e-source/e-source';
import './e-need-to-verify';

/**
 * List of drop sources.
 * @csspart active_drop_source - Dropsource involved in view transitions.
 */
@customElement('e-sources')
export class SourcesElement extends LitElement {
	@property({ type: Array }) sources: Source[] = [];
	@property({ reflect: true }) size: SourceSize = 'small';
	@property({ reflect: true, attribute: 'render-mode' }) renderMode: RenderMode = 'compact';
	@property({ reflect: true, attribute: 'verification-status' }) verificationStatus: VerificationStatus = 'done';
	/** Dropsource involved in view transitions */
	@property({ reflect: true }) active_drop_source?: string;

	protected render(): TemplateResult {
		const maps = this.sources.filter(({ type }) => type === 'Map');
		const non_maps = this.sources.filter(({ type }) => type !== 'Map');

		return html`${this.#list('non_maps', non_maps)}${this.#list('maps', maps)}`;
	}

	/** Reusable list of sources for maps and for non_maps */
	#list(source_types: 'maps' | 'non_maps', sources: Array<Source>): TemplateResult | typeof nothing {
		if (!sources.length) {
			return nothing;
		}
		return html`<ul class="${source_types === 'maps' ? 'sources-maps' : 'sources'}">
			${sources.map(source => {
				const source_template = html`
					<e-source
						part=${ifDefined(this.active_drop_source === source.idSlug ? 'active_drop_source' : undefined)}
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
			margin-top: 0.25rem;
			gap: 0.2rem;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-sources': SourcesElement;
	}
}
