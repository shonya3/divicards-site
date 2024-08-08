export type TransitionName = 'source' | 'card' | 'source-type';

export class NavigateTransitionEvent extends Event {
	transitionName: TransitionName;
	constructor(transitionName: TransitionName) {
		super('a-transition');
		this.transitionName = transitionName;
	}
}

declare global {
	interface HTMLElementEventMap {
		'navigate-transition': Event;
		'a-transition': NavigateTransitionEvent;
	}
}

export function dispatchTransition(this: HTMLElement, transitionName: TransitionName) {
	this.dispatchEvent(new NavigateTransitionEvent(transitionName));
}
