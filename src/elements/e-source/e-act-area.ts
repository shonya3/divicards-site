import { linkStyles } from '../../linkStyles';
import { classMap } from 'lit/directives/class-map.js';
import { html, css, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { dispatchSetTransitionName } from '../../events';
import type { ActArea } from '../../gen/poeData';
import type { SourceSize } from './types';

declare global {
	interface HTMLElementTagNameMap {
		'e-act-area': ActAreaElement;
	}
}

@customElement('e-act-area')
export class ActAreaElement extends LitElement {
	static override styles = [styles()];

	@property({ type: Object }) actArea!: ActArea;
	@property({ reflect: true }) size: SourceSize = 'large';
	@property({ reflect: true }) href = '';

	protected render(): TemplateResult {
		return html`<div
			style="--act-area-background-image: url(${this.actArea.imageUrl})"
			class=${classMap({
				'act-area': true,
				'act-area--small': this.size === 'small',
				'act-area--large': this.size === 'large',
				'act-area--medium': this.size === 'medium',
			})}
		>
			<a @click=${dispatchSetTransitionName.bind(this, 'source')} href=${this.href} class="name"
				>${this.actArea.name} (Act ${this.actArea.act})</a
			>
			<div class="area-level">Monster level: ${this.actArea.areaLevel}</div>
		</div>`;
	}
}

function styles() {
	return css`
		:host {
			display: inline-block;

			/* 507x98  */
			--act-area-background-image: '';
			--act-area-name-color: #fec076;
			--act-area-width-small: 261px;
			--act-area-width-medium: 380px;
			--act-area-width-large: 507px;
			--act-area-font-size-small: 14px;
			--act-area-font-size-medium: 16px;
			--act-area-font-size-large: 24px;
		}

		@layer reset {
			${linkStyles}
		}

		.act-area {
			line-height: 1.5rem;
			width: var(--act-area-width);
			background: rgba(0, 0, 0, 0) no-repeat center;
			background-size: 100%;
			background-image: var(--act-area-background-image);
			aspect-ratio: 5.173;
			position: relative;
		}

		.act-area--small {
			--act-area-width: var(--act-area-width-small);
			--act-area-font-size: var(--act-area-font-size-small);
			--act-area-name-top: 5px;
			--act-area-name-left: 20px;
			--act-area-area-level-top: 27px;
			--act-area-area-level-left: 20px;
			--act-area-area-level-font-size: 12px;
		}

		.act-area--medium {
			--act-area-width: var(--act-area-width-medium);
			--act-area-font-size: var(--act-area-font-size-medium);
			--act-area-name-top: 14px;
			--act-area-name-left: 30px;
			--act-area-area-level-top: 44px;
			--act-area-area-level-left: 30px;
			--act-area-area-level-font-size: 14px;
		}

		.act-area--large {
			--act-area-width: var(--act-area-width-large);
			--act-area-font-size: var(--act-area-font-size-large);
			--act-area-name-top: 20px;
			--act-area-name-left: 44px;
			--act-area-area-level-top: 62px;
			--act-area-area-level-left: 44px;
			--act-area-area-level-font-size: 20px;
		}

		img {
			width: 100%;
		}

		.name {
			position: absolute;
			font-size: var(--act-area-font-size, 20px);
			top: var(--act-area-name-top);
			left: var(--act-area-name-left);
			color: var(--act-area-name-color, red);
		}

		.name:hover {
			color: var(--link-color-hover);
		}

		.area-level {
			position: absolute;
			top: var(--act-area-area-level-top);
			left: var(--act-area-area-level-left);
			font-size: var(--act-area-area-level-font-size);
		}
	`;
}
