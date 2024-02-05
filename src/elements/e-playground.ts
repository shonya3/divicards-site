// declare global {
// 	interface HTMLElementTagNameMap {
// 		'e-playground': PlaygroundElement;
// 	}
// }

// import { LitElement, PropertyValueMap, css, html } from 'lit';
// import { customElement, state } from 'lit/decorators.js';

// import './elements/divination-card/e-divination-card';
// import './elements/e-need-to-verify';
// import './elements/e-source/e-source';
// import './elements/e-box';
// import type { ISource } from './gen/ISource.interface';

// @customElement('e-playground')
// export class PlaygroundElement extends LitElement {
// 	@state() source: ISource = { id: 'Port Map', type: 'Map', kind: 'source-with-member' };
// 	@state() cards = ['The Doctor', 'Rain of Chaos'];
// 	@state() borderIndex = 0;
// 	@state() elements = [{ id: 'Port Map', type: 'Map', kind: 'source-with-member' }, 'The Doctor'];

// 	#onClick() {
// 		document.startViewTransition(() => {
// 			this.borderIndex = this.borderIndex === 0 ? 1 : 0;
// 		});
// 	}
// 	render() {
// 		const elements = this.elements.map((data, index) => {
// 			if (typeof data === 'string') {
// 				const el = html`<e-divination-card name=${data}></e-divination-card>`;

// 				if (this.borderIndex === index) {
// 					return html`<e-new-need-to-verify><li>${el}</li></e-new-need-to-verify>`;
// 				} else {
// 					return html`<li>${el}</li>`;
// 				}
// 			} else {
// 				const el = html`<e-source .source=${data as ISource}></e-source>`;

// 				if (this.borderIndex === index) {
// 					return html`<e-new-need-to-verify><li>${el}</li></e-new-need-to-verify>`;
// 				} else {
// 					return html`<li>${el}</li>`;
// 				}
// 			}
// 		});

// 		const boxes = [1, 2].map((_, index) => {
// 			const el = html`<e-box></e-box>`;

// 			if (this.borderIndex === index) {
// 				return html`<e-new-need-to-verify>${el}</e-new-need-to-verify>`;
// 			} else {
// 				return html`${el}`;
// 			}
// 		});

// 		/*
// 		const _prev = html`<e-new-need-to-verify>
// 				<e-source .source=${this.source}></e-source>
// 			</e-new-need-to-verify>
// 			<e-new-need-to-verify></e-new-need-to-verify>`;
//         */

// 		// <ul>${elements}</ul>;

// 		return html`
// 			<button @click=${this.#onClick}>Move border</button>

// 			<ul>
// 				${elements}
// 			</ul>
// 			<e-need-to-verify>
// 				<e-source .source=${this.source}></e-source>
// 			</e-need-to-verify>
// 		`;
// 	}

// 	static styles = css`
// 		* {
// 			padding: 0;
// 			margin: 0;
// 		}

// 		:host {
// 			width: 1000px;
// 			height: 600px;
// 			display: block;
// 			margin-inline: auto;
// 			margin-top: 2rem;
// 		}

// 		e-source {
// 		}

// 		ul {
// 			padding: 2rem;
// 			list-style: none;
// 			display: flex;
// 			gap: 2rem;
// 		}
// 	`;
// }

// document.body.append(document.createElement('e-playground'));

// declare global {
// 	interface HTMLElementTagNameMap {
// 		'e-box': BoxElement;
// 	}
// }

// @customElement('e-box')
// export class BoxElement extends LitElement {
// 	@property({ type: Number, reflect: true }) width: number = 50;
// 	@property({ type: Number, reflect: true }) height: number = 50;
// 	@property({ reflect: true }) color = 'violet';

// 	protected willUpdate(map: PropertyValueMap<this>): void {
// 		if (map.has('width')) {
// 			this.style.setProperty('--width', `${this.width}px`);
// 		}

// 		if (map.has('height')) {
// 			this.style.setProperty('--height', `${this.height}px`);
// 		}

// 		if (map.has('color')) {
// 			this.style.setProperty('--background-color', this.color);
// 		}
// 	}

// 	protected render() {
// 		return html`<div class="box"></div>`;
// 	}

// 	static styles = css`
// 		* {
// 			padding: 0;
// 			margin: 0;
// 			box-sizing: border-box;
// 		}

// 		.box {
// 			height: var(--height);
// 			width: var(--width);
// 			background-color: var(--background-color);
// 		}
// 	`;
// }
