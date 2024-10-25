import '../attach_context_root';
import { provide } from '@lit/context';
import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { createContext } from '@lit/context';
import { DivcordTable } from './DivcordTable';
import { divcordLoader } from './DivcordLoader';
import { toast } from '../../toast';

export const divcordTableContext = createContext<DivcordTable>(Symbol('divcordTable'));

declare global {
	interface HTMLElementTagNameMap {
		'divcord-provider': DivcordProviderElement;
	}
}

@customElement('divcord-provider')
export class DivcordProviderElement extends LitElement {
	@provide({ context: divcordTableContext })
	@property({ type: Object })
	divcordTable: DivcordTable = new DivcordTable([]);

	async connectedCallback(): Promise<void> {
		super.connectedCallback();
		divcordLoader.addEventListener('records-updated', records => {
			this.divcordTable = new DivcordTable(records);
			toast('Your Divcord data is up-to-date', 'success', 3000);
		});

		const records = await divcordLoader.getRecordsAndStartUpdateIfNeeded();
		this.divcordTable = new DivcordTable(records);
	}

	protected render(): TemplateResult {
		return html`<slot></slot>`;
	}
}
