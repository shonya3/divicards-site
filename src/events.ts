export type TransitionName = 'source' | 'card' | 'source-type';

export class NavigateTransitionEvent extends Event {
	transitionName: TransitionName;
	slug?: string;
	constructor(transitionName: TransitionName, slug?: string) {
		super('navigate-transition', { bubbles: true, composed: true });
		this.transitionName = transitionName;
		this.slug = slug;
	}
}

declare global {
	interface HTMLElementEventMap {
		'navigate-transition': NavigateTransitionEvent;
	}
}

export function dispatchTransition(this: HTMLElement, transitionName: TransitionName, slug?: string) {
	this.dispatchEvent(new NavigateTransitionEvent(transitionName, slug));
}
