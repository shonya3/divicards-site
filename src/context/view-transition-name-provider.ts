import './attach_context_root';
import { createContext, provide } from '@lit/context';
import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type TransitionName = 'source' | 'card' | 'source-type';

/**
 * Dispatch this event to update view transition names in provider.
 */
export class UpdateViewTransitionNameEvent extends Event {
	transition_name: TransitionName;
	value?: string;
	constructor({ transition_name, value }: { transition_name: TransitionName; value: string }) {
		super('update-view-transition-name', { bubbles: true, composed: true });
		this.transition_name = transition_name;
		this.value = value;
	}
}

declare global {
	interface HTMLElementEventMap {
		'update-view-transition-name': UpdateViewTransitionNameEvent;
	}
}

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
		this.addEventListener('update-view-transition-name', this.update_view_transition_names);
	}

	update_view_transition_names = (e: UpdateViewTransitionNameEvent) => {
		if (e.transition_name === 'card') {
			this.view_transition_names.active_divination_card = e.value;
		}

		if (e.transition_name === 'source') {
			this.view_transition_names.active_drop_source = e.value;
		}

		this.view_transition_names = { ...this.view_transition_names };
	};

	protected render(): TemplateResult {
		return html`<slot></slot>`;
	}
}
