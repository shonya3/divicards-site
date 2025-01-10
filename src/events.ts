export type TransitionName = 'source' | 'card' | 'source-type';

export class NavigateTransitionEvent extends Event {
	transition_name: TransitionName;
	id?: string;
	constructor(transition_name: TransitionName, id?: string) {
		super('navigate-transition', { bubbles: true, composed: true });
		this.transition_name = transition_name;
		this.id = id;
	}
}

declare global {
	interface HTMLElementEventMap {
		'navigate-transition': NavigateTransitionEvent;
	}
}
