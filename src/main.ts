import './context/divcord/divcord-provider';
import './context/view-transition-name-provider';
import './main-layout';
import './elements/e-topnav';
import { render } from 'lit';
import { router } from './router';
import { startViewTransition } from './utils';

const page_slot = document.querySelector<HTMLElement>('[slot="page"]')!;

router.addEventListener('route-changed', async () => {
	const transition = startViewTransition(() => render(router.render(), page_slot));
	if (transition && router.skip_transition) {
		transition.skipTransition();
		router.skip_transition = false;
	}
});
router.dispatchEvent(new Event('route-changed'));
