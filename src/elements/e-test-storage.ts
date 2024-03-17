import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UseStorage } from '../controllers/UseStorage';

declare global {
	interface HTMLElementTagNameMap {
		'e-test-storage': TestStorageElement;
	}
}

declare module '../storage.ts' {
	interface Registry {
		count: number;
		numbers: number[];
	}
}

@customElement('e-test-storage')
export class TestStorageElement extends LitElement {
	#count = new UseStorage(this, 'count', 0);
	#numbers = new UseStorage(this, 'numbers', [1, 2, 3]);

	dec() {
		this.#count.setValue(value => value - 1);
	}

	inc() {
		this.#count.setValue(value => value + 1);
	}

	onAddNumber() {
		this.#numbers.setValue(nums => [...nums, (nums.at(-1) ?? 0) + 1]);
	}

	protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
		this.#numbers.setValue([]);
	}

	protected render() {
		return html`
			<div class="counter">
				<button @click=${this.dec}>-</button>${this.#count.value()}<button @click=${this.inc}>+</button>
			</div>
			<div class="numbers">
				<button @click=${this.onAddNumber}>Add number</button>
				<ul>
					${this.#numbers.value().map(number => html`<li>${number}</li>`)}
				</ul>
			</div>
		`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			gap: 1rem;

			font-size: 1.5rem;
		}

		.counter {
			display: flex;
			padding: 1rem;
			align-items: center;
			gap: 2rem;
		}

		.numbers {
			padding: 1rem;
			display: flex;
			align-items: center;
			gap: 2rem;
		}

		.numbers ul {
			display: flex;
			gap: 0.4rem;
			flex-wrap: wrap;
		}

		button {
			font: inherit;
			padding: 0.4rem 2rem;
		}

		ul {
			display: flex;
			flex-wrap: wrap;
			list-style: none;
		}
	`;
}
