import { render } from 'lit';
import { router } from './router';
import { startViewTransition } from './utils';

const page_slot = document.querySelector<HTMLElement>('[slot="page"]')!;

router.addEventListener('route-changed', async () => {
	await startViewTransition(() => {
		render(router.render(), page_slot);
	});
});
router.dispatchEvent(new Event('route-changed'));
