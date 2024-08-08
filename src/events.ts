export type TransitionName = 'source' | 'card' | 'source-type';

export class NavigateTransitionEvent extends Event {
	transitionName: TransitionName;
	constructor(transitionName: TransitionName) {
		super('navigate-transition');
		this.transitionName = transitionName;
	}
}

declare global {
	interface HTMLElementEventMap {
		'navigate-transition': NavigateTransitionEvent;
	}
}

export function dispatchTransition(this: HTMLElement, transitionName: TransitionName) {
	this.dispatchEvent(new NavigateTransitionEvent(transitionName));
}
