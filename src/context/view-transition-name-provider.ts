import './attach_context_root';
import { createContext, provide } from '@lit/context';
import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { NavigateTransitionEvent } from '../events';

declare global {
	interface HTMLElementTagNameMap {
		'view-transition-names-provider': ViewTransitionNamesProvider;
	}
}

export type ViewTransitionNamesContext = {
	active_divination_card?: string;
	active_drop_source?: string;
};

export const view_transition_names_context = createContext<ViewTransitionNamesContext>(Symbol('view_transition_names'));

@customElement('view-transition-names-provider')
export class ViewTransitionNamesProvider extends LitElement {
	@provide({ context: view_transition_names_context })
	@property({ type: Object, reflect: true })
	view_transition_names: ViewTransitionNamesContext = {};

	constructor() {
		super();
		this.addEventListener('navigate-transition', this.update_view_transition_names);
	}

	update_view_transition_names = (e: NavigateTransitionEvent) => {
		console.log(e);
		if (e.transition_name === 'card') {
			this.view_transition_names.active_divination_card = e.id;
		}

		if (e.transition_name === 'source') {
			this.view_transition_names.active_drop_source = e.id;
		}

		this.view_transition_names = { ...this.view_transition_names };
	};

	protected render(): TemplateResult {
		return html`<slot></slot>`;
	}
}
