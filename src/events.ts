export type TransitionName = 'source' | 'card' | 'source-type';
export class SetTransitionNameEvent extends CustomEvent<TransitionName> {
	constructor(transitionName: TransitionName) {
		super('set-transition-name', { detail: transitionName, bubbles: true, composed: true });
	}
}

declare global {
	interface HTMLElementEventMap {
		'set-transition-name': SetTransitionNameEvent;
	}
}

export function dispatchSetTransitionName(this: HTMLElement & { href?: string }, transitionName: TransitionName): void {
	if (this.href) {
		this.dispatchEvent(new SetTransitionNameEvent(transitionName));
	}
}
