import { linkStyles } from '../../linkStyles';
import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html, css, nothing, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './e-act-area';
import { sourceHref } from '../../utils';
import type { RenderMode } from '../types';
import type { ActArea, Bossfight } from '../../gen/poeData';
import { createSource } from '../../cards';
import { UpdateViewTransitionNameEvent } from '../../context/view-transition-name-provider';

/**
 * * @event navigate-transition NavigateTransitionEvent - Emits on clicking on any inner link element.
 */
@customElement('e-actboss')
export class ActBossElement extends LitElement {
	@property({ reflect: true }) slug!: string;
	@property({ type: Object }) boss!: Bossfight;
	@property({ type: Object }) actArea!: ActArea;
	@property({ reflect: true }) href: string = '';
	@property({ reflect: true }) renderMode: RenderMode = 'normal';

	protected render(): TemplateResult {
		return html`<div
			class=${classMap({
				actboss: true,
				[`rendermode--${this.renderMode}`]: true,
			})}
		>
			${this.renderMode === 'normal'
				? html`<e-act-area
						.href=${sourceHref(createSource({ type: 'Act', id: this.actArea.id }))}
						class="act-area"
						size="small"
						.actArea=${this.actArea}
				  ></e-act-area>`
				: nothing}

			<a href=${this.href} @click=${this.#dispatch_transition} class="bossname"
				>${this.boss.name}
				${this.renderMode === 'compact' ? html`<span>(Act ${this.actArea.act})</span>` : nothing}
			</a>
		</div>`;
	}

	#dispatch_transition() {
		this.dispatchEvent(new UpdateViewTransitionNameEvent({ transition_name: 'source', value: this.slug }));
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		:host {
			color: var(--source-color, #bbbbbb);
		}

		${linkStyles}

		.bossname {
			width: fit-content;
		}

		.act-area {
			margin-left: 4rem;
			transform: translateY(0.4rem);
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-actboss': ActBossElement;
	}
}
