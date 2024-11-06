import '../attach_context_root';
import { provide } from '@lit/context';
import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { createContext } from '@lit/context';
import { DivcordTable } from './DivcordTable';
import { divcordLoader } from './DivcordLoader';
import { toast } from '../../toast';
import { Signal, signal } from '@lit-labs/signals';

export const divcord_table_context = createContext<Signal.State<DivcordTable>>(Symbol('divcordTable'));

declare global {
	interface HTMLElementTagNameMap {
		'divcord-signal-provider': DivcordSignalProviderElement;
	}
}

@customElement('divcord-signal-provider')
export class DivcordSignalProviderElement extends LitElement {
	@provide({ context: divcord_table_context })
	@property({ type: Object })
	divcord_table = signal(new DivcordTable([]));

	async connectedCallback(): Promise<void> {
		super.connectedCallback();
		// divcordLoader.addEventListener('records-updated', records => {
		// 	this.divcord_table.set(new DivcordTable(records));
		// 	toast('Your Divcord data is up-to-date', 'success', 3000);
		// });

		const records = await divcordLoader.getRecordsAndStartUpdateIfNeeded();
		this.divcord_table.set(new DivcordTable(records));
	}

	protected render(): TemplateResult {
		return html`<slot></slot>`;
	}
}
