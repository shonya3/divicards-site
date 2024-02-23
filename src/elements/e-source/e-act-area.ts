import { linkStyles } from '../../linkStyles';
import { classMap } from 'lit/directives/class-map.js';
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { dispatchSetTransitionName } from '../../events';
import type { ActArea } from '../../gen/poeDataFromJson';

declare global {
	interface HTMLElementTagNameMap {
		'e-act-area': ActAreaElement;
	}
}

export type Size = 'small' | 'large';

@customElement('e-act-area')
export class ActAreaElement extends LitElement {
	static override styles = [styles()];

	@property({ type: Object }) actArea!: ActArea;
	@property({ reflect: true }) size: Size = 'large';
	@property({ reflect: true }) href = '';

	protected override render() {
		return html`<div
			style="--act-area-background-image: url(${this.actArea.imageUrl})"
			class=${classMap({
				'act-area': true,
				'act-area--small': this.size === 'small',
				'act-area--large': this.size === 'large',
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
			--act-area-width-large: 507px;
			--act-area-font-size-small: 15px;
			--act-area-font-size-large: 24px;
		}

		@layer reset {
			${linkStyles}
		}

		.act-area {
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
			--act-area-name-top: 8px;
			--act-area-name-left: 20px;
			--act-area-area-level-top: 32px;
			--act-area-area-level-left: 20px;
			--act-area-area-level-font-size: 12px;
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
