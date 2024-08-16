export type TransitionName = 'source' | 'card' | 'source-type';

export class NavigateTransitionEvent extends Event {
	transitionName: TransitionName;
	sourceSlug?: string;
	constructor(transitionName: TransitionName, sourceSlug?: string) {
		super('navigate-transition');
		this.transitionName = transitionName;
		this.sourceSlug = sourceSlug;
	}
}

declare global {
	interface HTMLElementEventMap {
		'navigate-transition': NavigateTransitionEvent;
	}
}

export function dispatchTransition(this: HTMLElement, transitionName: TransitionName, sourceSlug?: string) {
	this.dispatchEvent(new NavigateTransitionEvent(transitionName, sourceSlug));
}
export function redispatchTransition(this: HTMLElement, e: NavigateTransitionEvent) {
	this.dispatchEvent(new NavigateTransitionEvent(e.transitionName, e.sourceSlug));
}
