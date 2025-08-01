import './context/view-transition-name-provider';
import './layout/main-layout';
import './layout/e-topnav/e-topnav';
import { render } from 'lit';
import { router } from './router';
import { startViewTransition } from './utils';

const page_slot = document.querySelector<HTMLElement>('[slot="page"]')!;

router.addEventListener('route-changed', async () => {
	const transition = startViewTransition(() => {
		router.update_during_transition?.();
		render(router.render(), page_slot);
	});

	if (transition && router.skip_transition) {
		transition.skipTransition();
		router.skip_transition = false;
	}
});
router.dispatchEvent(new Event('route-changed'));
